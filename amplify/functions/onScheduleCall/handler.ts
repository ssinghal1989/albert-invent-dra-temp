import { Logger } from "@aws-lambda-powertools/logger";
import type { DynamoDBStreamHandler } from "aws-lambda";
import { DynamoDB, SES, AppSync } from "aws-sdk";
import { AddressList } from "aws-sdk/clients/ses";

const ses = new SES();
const appsync = new AppSync();


const logger = new Logger({
  logLevel: "INFO",
  serviceName: "dynamodb-stream-handler",
});

const SOURCE_EMAIL = process.env.SOURCE_EMAIL! || 'ssinghal1989@gmail.com';
const DESTINATION_EMAIL = process.env.DESTINATION_EMAIL! || 'ssinghal1989@gmail.com';
const APPSYNC_API_URL = process.env.APPSYNC_API_URL!;
const APPSYNC_API_KEY = process.env.APPSYNC_API_KEY!;

// Tier1 Template ID
const TIER1_TEMPLATE_ID = 'tier1_high_level_assessment';

// Function to fetch questions by template ID
async function getQuestionsByTemplate(templateId: string) {
  try {
    const query = `
      query ListQuestions($filter: ModelQuestionFilterInput) {
        listQuestions(filter: $filter) {
          items {
            id
            templateId
            sectionId
            order
            kind
            prompt
            helpText
            required
            metadata
            options {
              items {
                id
                label
                value
                score
              }
            }
          }
        }
      }
    `;

    const response = await fetch(APPSYNC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': APPSYNC_API_KEY,
      },
      body: JSON.stringify({
        query,
        variables: {
          filter: {
            templateId: { eq: templateId }
          }
        }
      })
    });

    const result = await response.json();
    
    if (result.data?.listQuestions?.items) {
      // Sort questions by order and flatten options
      const questions = result.data.listQuestions.items
        .map((question: any) => ({
          ...question,
          options: question.options?.items || []
        }))
        .sort((a: any, b: any) => a.order - b.order);
      
      return { success: true, data: questions };
    }
    
    return { success: false, error: 'No questions found' };
  } catch (error) {
    logger.error('Error fetching questions by template:', error);
    return { success: false, error };
  }
}

// Function to generate Tier1 assessment grid HTML from questions and user responses
function generateTier1AssessmentGrid(questions: any[], userResponses: any, score: any) {
  if (!questions || questions.length === 0 || !userResponses) {
    return '<p style="color: #666; font-style: italic;">No Tier1 assessment data available.</p>';
  }

  const parsedResponses = typeof userResponses === 'string' ? JSON.parse(userResponses) : userResponses;
  const parsedScore = typeof score === 'string' ? JSON.parse(score) : score;

  // Get unique maturity levels from all questions
  const maturityLevels = new Set<string>();
  questions.forEach(question => {
    question.options.forEach((option: any) => {
      maturityLevels.add(option.label);
    });
  });
  const sortedMaturityLevels = Array.from(maturityLevels).sort();

  let gridHtml = `
    <div style="margin: 20px 0;">
      <h3 style="color: #333; margin-bottom: 15px; font-size: 18px;">Tier 1 Assessment Results</h3>
      ${parsedScore ? `
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #007bff;">
          <p style="margin: 0; font-weight: bold; color: #333;">
            Overall Score: <span style="color: #007bff; font-size: 18px;">${parsedScore.overallScore || 'N/A'}</span>
            ${parsedScore.maturityLevel ? ` - ${parsedScore.maturityLevel} Level` : ''}
          </p>
        </div>
      ` : ''}
      <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 12px;">
        <thead>
          <tr style="background-color: #f8f9fa;">
            <th style="border: 1px solid #dee2e6; padding: 12px 8px; text-align: left; font-weight: bold; color: #495057; width: 25%;">
              Focus Areas
            </th>
            ${sortedMaturityLevels.map(level => `
              <th style="border: 1px solid #dee2e6; padding: 12px 8px; text-align: center; font-weight: bold; color: #495057; width: 18.75%;">
                ${level}
              </th>
            `).join('')}
          </tr>
        </thead>
        <tbody>
  `;

  questions.forEach(question => {
    const userResponse = parsedResponses[question.id];
    const selectedOption = question.options.find((opt: any) => opt.value === userResponse);
    
    gridHtml += `
      <tr>
        <td style="border: 1px solid #dee2e6; padding: 12px 8px; font-weight: 600; background-color: #f8f9fa; color: #495057;">
          ${question.prompt}
        </td>
    `;

    sortedMaturityLevels.forEach(level => {
      const option = question.options.find((opt: any) => opt.label === level);
      const isSelected = selectedOption && selectedOption.label === level;
      const cellContent = option ? option.label : '';
      
      gridHtml += `
        <td style="border: 1px solid #dee2e6; padding: 8px; font-size: 11px; line-height: 1.4; ${
          isSelected 
            ? 'background-color: #007bff; color: white; font-weight: bold;' 
            : 'background-color: white; color: #495057;'
        }">
          ${isSelected ? `✓ ${cellContent}` : cellContent}
        </td>
      `;
    });

    gridHtml += '</tr>';
  });

  gridHtml += `
        </tbody>
      </table>
    </div>
  `;

  return gridHtml;
}


export const handler: DynamoDBStreamHandler = async (event) => {
  for (const record of event.Records) {
    logger.info(`Processing record: ${record}, ${record.eventID}`);
    logger.info(`Event Type: ${record.eventName}`);

    if (record.eventName === "INSERT") {
      const newRecord = DynamoDB.Converter.unmarshall(
        record.dynamodb?.NewImage!
      );

      if (newRecord.__typename === "ScheduleRequest") {
        const metadata = newRecord.metadata;
        
        // Get user responses and score from metadata
        const userResponses = metadata.tier1Responses;
        const assessmentScore = metadata.assessmentScore;
        
        // Fetch Tier1 questions to build the grid
        let tier1Questions = null;
        if (userResponses) {
          const questionsResult = await getQuestionsByTemplate(TIER1_TEMPLATE_ID);
          if (questionsResult.success) {
            tier1Questions = questionsResult.data;
          }
        }
        
        const { html, subject, text } = await formatScheduleRequestEmail({
          type: newRecord.type as "TIER1_FOLLOWUP" | "TIER2_REQUEST",
          remarks: newRecord.remarks,
          preferredDate: newRecord.preferredDate,
          preferredTimes: newRecord.preferredTimes,
          userEmail: metadata.userEmail,
          userName: metadata.userName,
          userJobTitle: metadata.userJobTitle,
          companyDomain: metadata.companyDomain,
          companyName: metadata.companyName,
          assessmentScore: metadata.assessmentScore,
        }, tier1Assessment);
        }, { questions: tier1Questions, responses: userResponses, score: assessmentScore });

        try {
          logger.info(`Sending EMail from ${SOURCE_EMAIL} to ${DESTINATION_EMAIL}`)
          await ses
            .sendEmail({
              Destination: {
                ToAddresses: DESTINATION_EMAIL.split(',') as AddressList,
              },
              Message: {
                Body: { Text: { Data: text }, Html: { Data: html } },
                Subject: { Data: subject },
              },
              Source: `"Albert Invent DRA" <${SOURCE_EMAIL}>`, // must be SES-verified
            })
            .promise();
        } catch (err) {
          console.error("❌ Failed to send email:", err);
          throw err;
        }
      }
    }
  }

  return {
    batchItemFailures: [],
  };
};

export interface ScheduleRequestData {
  type: "TIER1_FOLLOWUP" | "TIER2_REQUEST";
  userEmail: string;
  userName: string;
  userJobTitle?: string;
  companyName: string;
  companyDomain: string;
  preferredDate: string;
  preferredTimes: string[];
  remarks?: string;
  assessmentScore?: string;
}

const formatScheduleRequestEmail = async (requestData: ScheduleRequestData, tier1Data?: { questions: any[], responses: any, score: any }) => {
  const isFollowUp = requestData.type === "TIER1_FOLLOWUP";
  const requestType = isFollowUp
    ? "Tier 1 Follow-up Call"
    : "Tier 2 In-Depth Assessment";

  const subject = `${requestType} Request - ${requestData.companyName}`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTimes = (times: string[]) => {
    return times
      .map((time) => {
        const [hours, minutes] = time.split(":");
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHour}:${minutes} ${ampm}`;
      })
      .join(", ");
  };

  const getScoreColor = (score: number): string => {
    if (score >= 87.5) return "#10b981"; // emerald-500 - World Class (green)
    if (score >= 62.5) return "#3b82f6"; // blue-500 - Established (blue)
    if (score >= 37.5) return "#f59e0b"; // amber-500 - Emerging (orange)
    return "#ef4444"; // red-500 - Basic (red)
  };

  // Generate Tier1 assessment grid if available
  const tier1GridHtml = tier1Data && tier1Data.questions && tier1Data.responses
    ? generateTier1AssessmentGrid(tier1Data.questions, tier1Data.responses, tier1Data.score)
    : '';

  const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">${requestType} Request</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #333; margin-top: 0;">Request Details</h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #555;">Request Type:</td>
              <td style="padding: 8px 0;">${requestType}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #555;">Contact Name:</td>
              <td style="padding: 8px 0;">${requestData.userName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #555;">Email:</td>
              <td style="padding: 8px 0;">${requestData.userEmail}</td>
            </tr>
            ${
              requestData.userJobTitle
                ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #555;">Job Title:</td>
              <td style="padding: 8px 0;">${requestData.userJobTitle}</td>
            </tr>
            `
                : ""
            }
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #555;">Company:</td>
              <td style="padding: 8px 0;">${requestData.companyName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #555;">Company Domain:</td>
              <td style="padding: 8px 0;">${requestData.companyDomain}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #555;">Preferred Date:</td>
              <td style="padding: 8px 0;">${formatDate(
                requestData.preferredDate
              )}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #555;">Preferred Times:</td>
              <td style="padding: 8px 0;">${formatTimes(
                requestData.preferredTimes
              )}</td>
            </tr>
            ${
              requestData.remarks
                ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #555; vertical-align: top;">Remarks:</td>
              <td style="padding: 8px 0;">${requestData.remarks}</td>
            </tr>
            `
                : ""
            }
            ${requestData.assessmentScore ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #555;">Assessment Score:</td>
              <td style="padding: 8px 0; color: ${getScoreColor(parseInt(requestData.assessmentScore))}">${requestData.assessmentScore}</td>
            </tr>
            ` : ''}
          </table>
          
          ${tier1GridHtml ? `
            ${tier1GridHtml}
          ` : ''}
          
          <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-left: 4px solid #2196f3; border-radius: 4px;">
            <p style="margin: 0; color: #1565c0;">
              <strong>Next Steps:</strong> Please review this request and reach out to schedule the ${requestType.toLowerCase()}.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
          <p>This is an automated notification from Albert Invent Digital Readiness Assessment Platform</p>
        </div>
      </div>
    `;

  const text = `
        New ${requestType} Request

        Contact Details:
        - Name: ${requestData.userName}
        - Email: ${requestData.userEmail}
        ${
          requestData.userJobTitle
            ? `- Job Title: ${requestData.userJobTitle}\n`
            : ""
        }- Company: ${requestData.companyName}

        Schedule Preferences:
        - Date: ${formatDate(requestData.preferredDate)}
        - Times: ${formatTimes(requestData.preferredTimes)}

        ${requestData.remarks ? `Remarks: ${requestData.remarks}\n` : ""}
        Please review this request and reach out to schedule the ${requestType.toLowerCase()}.
            `;

  return { subject, html, text };
};
