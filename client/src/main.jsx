import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './i18n';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { HelmetProvider } from 'react-helmet-async';

// Google Client ID — in production, move to .env (VITE_GOOGLE_CLIENT_ID)
const GOOGLE_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "281397897114-35k0g11sp3sqttotdni7qvtiidifrump.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_ID}>
      <AuthProvider>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
);