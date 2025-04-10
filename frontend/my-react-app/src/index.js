import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// import App from './App';
// import reportWebVitals from './reportWebVitals';
import MapView from './App';
const root = ReactDOM.createRoot(document.getElementById('root'));
const droneData = [
  { id: 'DR-101', lat: 28.61, lng: 77.20 },
  { id: 'DR-102', lat: 28.70, lng: 77.10 },
  // real-time values later via WebSocket or API
];

root.render(
   <MapView drones={droneData}/>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
