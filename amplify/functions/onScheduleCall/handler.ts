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

// Tier1 Assessment Data Structure
const TIER1_FOCUS_AREAS = [
  'Data Architecture and Integration',
  'Data Governance and Trust', 
  'Smart Lab and Workflow Automation',
  'Analytics and AI-driven Discovery',
  'Manufacturing and Scale-up Integration',
  'Leadership and Digital Culture',
  'Skills and Workforce Enablement',
  'Customer and Market Feedback Integration',
  'Sustainability and Regulatory Intelligence',
  'Supplier Ecosystem Connectivity'
];

const MATURITY_LEVELS = ['Basic', 'Emerging', 'Established', 'World Class'];

const TIER1_GRID_DATA = {
  'Data Architecture and Integration': {
    'Basic': 'Data is fragmented, stored in spreadsheets or local systems',
    'Emerging': 'Some systems connected, early standardization efforts',
    'Established': 'Unified data model, most key systems integrated',
    'World Class': 'Fully scalable, interoperable architecture supports innovation'
  },
  'Data Governance and Trust': {
    'Basic': 'No formal ownership or quality controls, data often unreliable',
    'Emerging': 'Defined ownership and data validation in early stages',
    'Established': 'Fair principles applied, governed processes standards',
    'World Class': 'Trusted high-quality data used across R&D and partners'
  },
  'Smart Lab and Workflow Automation': {
    'Basic': 'Paper-based records, disconnected instruments',
    'Emerging': 'Basic ELN use, isolated instrument capture',
    'Established': 'Connected lab systems, automated data capture expanding',
    'World Class': 'Fully automated smart lab with orchestration and robotics'
  },
  'Analytics and AI-driven Discovery': {
    'Basic': 'Manual reporting, no advanced analytics',
    'Emerging': 'Dashboards and BI tools used by select teams',
    'Established': 'Predictive models in use, analytics embedded in workflows',
    'World Class': 'AI/ML drives discovery, prescriptive analytics common'
  },
  'Manufacturing and Scale-up Integration': {
    'Basic': 'Manual tech transfer, R&D and Ops disconnected',
    'Emerging': 'R&D collects manufacturing data, with basic structure',
    'Established': 'Digital twins and structured tech transfer established',
    'World Class': 'Live feedback from manufacturing informs real-time R&D updates'
  },
  'Leadership and Digital Culture': {
    'Basic': 'No shared digital vision, limited executive engagement',
    'Emerging': 'Leadership expresses support, early digital culture efforts',
    'Established': 'Digital vision cascaded, digital innovation encouraged',
    'World Class': 'Leaders model digital behaviors, digital culture deeply embedded'
  },
  'Skills and Workforce Enablement': {
    'Basic': 'Minimal digital training, reliance on individual workarounds',
    'Emerging': 'Introductory training programs in place, limited support',
    'Established': 'Role-specific training and digital career paths defined with digital roles introduced in the organization',
    'World Class': 'Workforce excels in digital tools with continuous upskill, digital roles and career paths are robust'
  },
  'Customer and Market Feedback Integration': {
    'Basic': 'Customer input captured ad hoc, if at all',
    'Emerging': 'Structured VOC processes in place for key products',
    'Established': 'Feedback loops tied to product development decisions',
    'World Class': 'Real-time customer input continuously informs R&D'
  },
  'Sustainability and Regulatory Intelligence': {
    'Basic': 'Sustainability not considered in R&D decisions',
    'Emerging': 'Sustainability metrics tracked post-development',
    'Established': 'Sustainability built into early R&D design tools',
    'World Class': 'Eco-impact simulated during design, fully compliant by design'
  },
  'Supplier Ecosystem Connectivity': {
    'Basic': 'Email-based communications, no shared digital space',
    'Emerging': 'Some shared portals, supplier specs partially digitized',
    'Established': 'Digitally managed supplier data, real-time traceability',
    'World Class': 'Seamless secure integration across global ecosystem'
  }
};

// Function to fetch user's Tier1 assessment data
async function fetchUserTier1Assessment(userId: string) {
  try {
    const query = `
      query ListAssessmentInstanceByInitiatorUserIdAndCreatedAt($initiatorUserId: ID!) {
        listAssessmentInstanceByInitiatorUserIdAndCreatedAt(initiatorUserId: $initiatorUserId) {
          items {
            id
            assessmentType
            responses
            score
            createdAt
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
        variables: { initiatorUserId: userId }
      })
    });

    const result = await response.json();
    
    if (result.data?.listAssessmentInstanceByInitiatorUserIdAndCreatedAt?.items) {
      const tier1Assessments = result.data.listAssessmentInstanceByInitiatorUserIdAndCreatedAt.items
        .filter((item: any) => item.assessmentType === 'TIER1')
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      return tier1Assessments[0] || null; // Return most recent Tier1 assessment
    }
    
    return null;
  } catch (error) {
    logger.error('Error fetching Tier1 assessment:', error);
    return null;
  }
}

// Function to generate Tier1 assessment grid HTML
function generateTier1AssessmentGrid(responses: any, score: any) {
  if (!responses) {
    return '<p style="color: #666; font-style: italic;">No Tier1 assessment data available.</p>';
  }

  const parsedResponses = typeof responses === 'string' ? JSON.parse(responses) : responses;
  const parsedScore = typeof score === 'string' ? JSON.parse(score) : score;

  // Create a mapping of question prompts to responses
  const responseMap: { [key: string]: string } = {};
  
  // Since we don't have question prompts in the response, we'll use the focus areas
  // This assumes the responses are in the same order as TIER1_FOCUS_AREAS
  const responseValues = Object.values(parsedResponses);
  TIER1_FOCUS_AREAS.forEach((area, index) => {
    if (responseValues[index]) {
      responseMap[area] = responseValues[index] as string;
    }
  });

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
            ${MATURITY_LEVELS.map(level => `
              <th style="border: 1px solid #dee2e6; padding: 12px 8px; text-align: center; font-weight: bold; color: #495057; width: 18.75%;">
                ${level}
              </th>
            `).join('')}
          </tr>
        </thead>
        <tbody>
  `;

  TIER1_FOCUS_AREAS.forEach(area => {
    const userResponse = responseMap[area];
    const normalizedResponse = userResponse ? userResponse.toLowerCase().replace(/_/g, ' ') : '';
    
    gridHtml += `
      <tr>
        <td style="border: 1px solid #dee2e6; padding: 12px 8px; font-weight: 600; background-color: #f8f9fa; color: #495057;">
          ${area}
        </td>
    `;

    MATURITY_LEVELS.forEach(level => {
      const isSelected = normalizedResponse === level.toLowerCase();
      const cellContent = TIER1_GRID_DATA[area as keyof typeof TIER1_GRID_DATA]?.[level] || '';
      
      gridHtml += `
        <td style="border: 1px solid #dee2e6; padding: 8px; font-size: 11px; line-height: 1.4; ${
          isSelected 
            ? 'background-color: #007bff; color: white; font-weight: bold;' 
            : 'background-color: white; color: #495057;'
        }">
          ${cellContent}
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
        
        // Fetch user's Tier1 assessment data
        const tier1Assessment = await fetchUserTier1Assessment(newRecord.initiatorUserId);
        
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

const formatScheduleRequestEmail = async (requestData: ScheduleRequestData, tier1Assessment?: any) => {
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
  const tier1GridHtml = tier1Assessment 
    ? generateTier1AssessmentGrid(tier1Assessment.responses, tier1Assessment.score)
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
