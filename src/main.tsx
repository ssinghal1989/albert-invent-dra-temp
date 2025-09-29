import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import outputs from "../amplify_outputs.json";
import '@aws-amplify/ui-react/styles.css';
Amplify.configure(outputs);

createRoot(document.getElementById('root')!).render(
  <Authenticator.Provider>
    <StrictMode>
      <App />
    </StrictMode>
  </Authenticator.Provider>
  
);
