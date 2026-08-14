import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const PASSWORD = 'KochiDemo2026';

function ProtectedApp() {
  const entered = window.prompt('Enter demo password');

  if (entered !== PASSWORD) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial'
      }}>
        <h2>Access Denied</h2>
      </div>
    );
  }

  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ProtectedApp />
  </React.StrictMode>
);
