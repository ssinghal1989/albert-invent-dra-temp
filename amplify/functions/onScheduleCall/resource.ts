import { defineFunction } from "@aws-amplify/backend";

export const onScheduleCallFunction = defineFunction({
  name: "onScheduleCall-function",
  entry: './handler.ts',
  environment: {
    'SOURCE_EMAIL' : 'sonu@albertinvent.com',
    'DESTINATION_EMAIL': 'sonu@albertinvent.com, ssinghal1989@gmail.com',
  }
});