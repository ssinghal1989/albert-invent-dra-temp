import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import { initializeClient } from './services/amplifyService';
import App from './App.tsx';
import './index.css';

// Configure Amplify with placeholder config for development
// try {
//   //const outputs = await import('../amplify_outputs.json');
//   Amplify.configure(outputs.default);
//   initializeClient();
// } catch (error) {
//   console.warn('amplify_outputs.json not found, using placeholder config');
//   Amplify.configure({
//     Auth: {
//       region: 'us-east-1',
//       userPoolId: 'placeholder',
//       userPoolWebClientId: 'placeholder',
//     },
//     API: {
//       GraphQL: {
//         endpoint: 'https://placeholder.appsync-api.us-east-1.amazonaws.com/graphql',
//         region: 'us-east-1',
//         defaultAuthMode: 'apiKey',
//         apiKey: 'placeholder'
//       }
//     }
//   });
//   initializeClient();
// }

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
