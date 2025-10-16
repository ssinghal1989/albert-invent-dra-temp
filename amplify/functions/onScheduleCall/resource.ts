import { defineFunction } from "@aws-amplify/backend";

export const onScheduleCallFunction = defineFunction({
  name: "onScheduleCall-function",
  entry: './handler.ts',
  environment: {
    'SOURCE_EMAIL' : 'schedule@albertinvent.com',
    'DESTINATION_EMAIL': 'gavin@albertinvent.com, adam.pashley@albertinvent.com, zoe@albertinvent.com, Jon@albertinvent.com, roger@albertinvent.com, carol@albertinvent.com, sonu@albertinvent.com',
  }
});