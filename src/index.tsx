import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {GlobalStateProvider} from './GlobalStateProvider';
import App from './App.tsx';
import dayjs from 'dayjs';
import 'dayjs/locale/sr.js';
import localeData from 'dayjs/plugin/localeData';
import './i18n.ts';

dayjs.extend(localeData);
dayjs.locale('sr')


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
