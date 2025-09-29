import { ClientSchema } from '@aws-amplify/backend';
import type { Schema } from '../amplify/data/resource';
import { schema } from '../amplify/data/resource';
import { generateClient } from 'aws-amplify/api';

export type LocalSchema = ClientSchema<typeof schema>;

export const client = generateClient<Schema>()