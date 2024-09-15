import {Theme} from '@mui/material';

export default interface TabProps {
  visible: boolean;
  style?: any;
  showSnackbar: (type: 'success' | 'info' | 'warning' | 'error', message: string) => void;
  theme: Theme
}
