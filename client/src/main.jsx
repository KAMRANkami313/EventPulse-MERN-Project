import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './i18n'; 
import { GoogleOAuthProvider } from '@react-oauth/google'; // ✅ Import Provider

// 👇 PASTE YOUR GOOGLE CLIENT ID INSIDE THESE QUOTES 👇
const GOOGLE_ID = "281397897114-35k0g11sp3sqttotdni7qvtiidifrump.apps.googleusercontent.com"; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_ID}>
        <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
);