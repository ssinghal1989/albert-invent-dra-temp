import { defineFunction } from '@aws-amplify/backend';

export const assessmentProcessor = defineFunction({
  name: 'assessment-processor',
  entry: './handler.ts',
});