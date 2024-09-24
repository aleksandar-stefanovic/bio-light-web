import {InputAdornment, TextField} from '@mui/material';
import React from 'react';
import {Search} from '@mui/icons-material';

interface SearchBarProps {
  onSearchTerm : (term: string) => void;
  timeout: number;
  style?: React.CSSProperties;
}

export default function SearchBar({onSearchTerm, style}: SearchBarProps) {

  const [searchTerm, setSearchTerm] = React.useState<string>('');

  React.useEffect(() => {
    onSearchTerm(searchTerm);
  }, [searchTerm, onSearchTerm]);

  return <TextField type='search'
                    value={searchTerm}
                    style={style}
                    onChange={e => setSearchTerm(e.target.value)}
                    slotProps={{
                        input: {
                            startAdornment: <InputAdornment position='start'><Search></Search></InputAdornment>
                        }
                    }}
  placeholder='Pretraga'></TextField>
}
