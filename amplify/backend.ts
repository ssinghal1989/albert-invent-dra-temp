import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { onScheduleCallFunction } from "./functions/onScheduleCall/resource";
import { Policy, PolicyStatement, Effect } from "aws-cdk-lib/aws-iam";
import { StartingPosition, EventSourceMapping } from "aws-cdk-lib/aws-lambda";
import { Stack } from "aws-cdk-lib";

export const backend = defineBackend({
  auth,
  data,
  onScheduleCallFunction,
});

const schduleCallTable = backend.data.resources.tables["ScheduleRequest"];
const policy = new Policy(
  Stack.of(schduleCallTable),
  "OnScheduleCallFunctionStreamingPolicy",
  {
    statements: [
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          "dynamodb:DescribeStream",
          "dynamodb:GetRecords",
          "dynamodb:GetShardIterator",
          "dynamodb:ListStreams",
          "ses:SendEmail",
        ],
        resources: ["*"],
      })
    ],
  }
);

backend.onScheduleCallFunction.resources.lambda.role?.attachInlinePolicy(
  policy
);

const mapping = new EventSourceMapping(
  Stack.of(schduleCallTable),
  "OnScheduleCallFunctionScheduleCallEventStreamMapping",
  {
    target: backend.onScheduleCallFunction.resources.lambda,
    eventSourceArn: schduleCallTable.tableStreamArn,
    startingPosition: StartingPosition.LATEST,
  }
);

mapping.node.addDependency(policy);
