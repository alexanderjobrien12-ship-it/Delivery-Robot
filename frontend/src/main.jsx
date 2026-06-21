// main.jsx is the entry point — it finds the <div id="root"> in index.html
// and tells React to take over that div and render our App inside it.
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
