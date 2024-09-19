import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { Auth0Provider } from '@auth0/auth0-react'; // Importez Auth0Provider

// Remplacez les valeurs avec vos informations Auth0
const domain = "dev-sb8zrj3aebrzbf6c.eu.auth0.com";
const clientId = "gLDJEdryYrkWGWacpNFCaIiq95BGEUwD";
const redirectUri = "http://localhost:5173/offers";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{ redirect_uri: redirectUri }}
    >
      <App />
    </Auth0Provider>
  </StrictMode>
);
