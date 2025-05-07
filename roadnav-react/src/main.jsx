import "bootstrap/dist/css/bootstrap.min.css";
import 'leaflet/dist/leaflet.css';   
import { AuthProvider } from './contexts/AuthContext';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);

