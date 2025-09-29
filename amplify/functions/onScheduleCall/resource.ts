import { defineFunction } from "@aws-amplify/backend";

export const onScheduleCallFunction = defineFunction({
  name: "onScheduleCall-function",
  entry: './handler.ts',
  environment: {
    'SOURCE_EMAIL' : 'sonu@albertinvent.com',
    'DESTINATION_EMAIL': 'sonu@albertinvent.com, ssinghal1989@gmail.com',
    'APPSYNC_API_URL': 'https://hdowzq5ndfh2xi73uon2fnggby.appsync-api.ap-south-1.amazonaws.com/graphql',
    'APPSYNC_API_KEY': 'da2-5gccphfsk5dwrgzajxqxmma37q'
  }
});