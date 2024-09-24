import {InputAdornment, TextField} from '@mui/material';
import React from 'react';

interface NumberFieldProps {
  label: string;
  size?: 'small' | 'medium';
  onChange: (value: number) => void;
  endAdornment?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  initialValue?: number;
}

export default function NumberField({label, size = 'medium', onChange, endAdornment, style, disabled, initialValue}: NumberFieldProps) {

  const [value, setValue] = React.useState(initialValue?.toString() ?? '');

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    let stringValue = event.target.value as string;
    if ((stringValue.match(/\./g)?.length || 0) > 1) {
      return;
    }
    const endsWithDecimalPoint = (stringValue).endsWith('.');
    stringValue = endsWithDecimalPoint ? stringValue.substring(0, stringValue.length - 1) : stringValue;
    const value = Number(stringValue);
    if (!isNaN(value)) {
      setValue(event.target.value);
      onChange(value);
    }
  }

  return <TextField
    style={style}
    label={label}
    size={size}
    value={value}
    disabled={disabled}
    slotProps={endAdornment ? {
      input: {
        endAdornment: <InputAdornment position='end'>{endAdornment}</InputAdornment>
      }
    } : undefined}
    onChange={handleChange}
    type='number'
  />
}
