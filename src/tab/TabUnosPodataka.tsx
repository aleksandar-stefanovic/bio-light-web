import {Button} from '@mui/material';
import React, {ChangeEvent, CSSProperties} from 'react';
import Customer from '../data/Customer.ts';

interface UnosPodatakaProps {
  visible: boolean;
  style: CSSProperties;
}

export default function UnosPodataka({visible, style}: UnosPodatakaProps) {

  const [kupci, setKupci] = React.useState<Customer[]>([]);

  function handleKupacSelection(e: ChangeEvent<HTMLInputElement>) {
    const fileReader: FileReader = new FileReader();
    const blob = e?.target?.files?.[0];
    if (blob) {
      fileReader.readAsText(blob, 'UTF-8');
      fileReader.onload = (e) => {
        const kupacs: Customer[] = JSON.parse(e?.target?.result as string);
        setKupci(kupacs)
      }
    }
  }

  function insertKupac() {

  }

  return <div style={{...style, display: visible ? 'flex' : 'none'}}>
    <div>
      <input type='file' onChange={handleKupacSelection}/>
      <Button variant='contained' onClick={insertKupac}>Unesi kupce</Button>
      <p>Broj kupaca: {kupci.length}</p>
    </div>
  </div>
}
