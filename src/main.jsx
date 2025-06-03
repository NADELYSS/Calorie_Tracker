import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { UserContext } from './context/UserContext';

function Root() {
  const [userId, setUserId] = useState(() => {
    return localStorage.getItem('userId') || 'guest';
  });

  useEffect(() => {
    localStorage.setItem('userId', userId);
  }, [userId]);

  return (
    <UserContext.Provider value={{ userId, setUserId }}>
      <App />
    </UserContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
