import {Theme} from '@mui/material';
import {CSSProperties} from 'react';

export default interface TabProps {
  visible: boolean;
  style?: CSSProperties;
  showSnackbar: (type: 'success' | 'info' | 'warning' | 'error', message: string) => void;
  theme: Theme
}
