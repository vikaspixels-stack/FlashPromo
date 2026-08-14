import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const PASSWORD = 'KochiDemo2026';

const entered = window.prompt('Enter demo password');

if (entered !== PASSWORD) {
  document.body.innerHTML = `
    <div style='height:100vh;display:flex;align-items:center;justify-content:center;font-family:Arial'>
      <div style='text-align:center'>
        <h2>Access Denied</h2>
        <p>Wrong password</p>
      </div>
    </div>
  `;
} else {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
