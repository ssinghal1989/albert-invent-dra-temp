import { Logger } from "@aws-lambda-powertools/logger";
import type { DynamoDBStreamHandler } from "aws-lambda";
import { DynamoDB, SES } from "aws-sdk";
import { AddressList } from "aws-sdk/clients/ses";
import { getHubSpotService } from "../../../src/services/HubspotService";

const ses = new SES();


const logger = new Logger({
  logLevel: "INFO",
  serviceName: "dynamodb-stream-handler",
});

const SOURCE_EMAIL = process.env.SOURCE_EMAIL! || 'ssinghal1989@gmail.com';
const DESTINATION_EMAIL = process.env.DESTINATION_EMAIL! || 'ssinghal1989@gmail.com';
const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;


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
        
        // HubSpot Integration
        if (HUBSPOT_ACCESS_TOKEN) {
          try {
            const hubspotService = getHubSpotService(HUBSPOT_ACCESS_TOKEN);
            const hubspotResult = await hubspotService.createCallRequestWorkflow({
              userEmail: metadata.userEmail,
              userName: metadata.userName,
              userJobTitle: metadata.userJobTitle,
              companyName: metadata.companyName,
              companyDomain: metadata.companyDomain,
              callType: newRecord.type as "TIER1_FOLLOWUP" | "TIER2_REQUEST",
              assessmentScore: metadata.assessmentScore ? parseInt(metadata.assessmentScore) : undefined,
              preferredDate: newRecord.preferredDate,
              preferredTimes: newRecord.preferredTimes,
              remarks: newRecord.remarks,
            });
            
            if (hubspotResult.success) {
              logger.info(`✅ HubSpot integration successful: ${hubspotResult.message}`);
            } else {
              logger.error(`❌ HubSpot integration failed: ${hubspotResult.error}`);
            }
          } catch (hubspotError) {
            logger.error("❌ HubSpot integration error:", JSON.stringify(hubspotError));
          }
        } else {
          logger.info("⚠️ HubSpot integration skipped - no access token provided");
        }

        const { html, subject, text } = formatScheduleRequestEmail({
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
        });

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

const formatScheduleRequestEmail = (requestData: ScheduleRequestData) => {
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
