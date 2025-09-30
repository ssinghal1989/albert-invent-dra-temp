import { defineFunction } from "@aws-amplify/backend";

export const onScheduleCallFunction = defineFunction({
  name: "onScheduleCall-function",
  entry: './handler.ts',
});