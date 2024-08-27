import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {GlobalStateProvider} from './GlobalStateProvider';
import App from './App.tsx';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <GlobalStateProvider>
        <App />
      </GlobalStateProvider>
    </LocalizationProvider>
  </React.StrictMode>
);
