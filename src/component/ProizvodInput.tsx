import {
  Button,
  FormControl,
  FormControlLabel, InputAdornment,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent, TextField
} from '@mui/material';
import React, {useCallback, useState} from 'react';
import NumberField from './NumberField';
import Proizvod from '../data/Proizvod';
import StProizvod from '../data/StProizvod';
import Cena from '../data/Cena';

interface ProizvodInputProps {
  style?: React.CSSProperties;
  onAdd: (stProizvod: StProizvod) => void;
  onError: (message: string) => void;
  defaultRabat?: number;
  disabled: boolean;
  proizvods?: Proizvod[];
  cenas: Cena[];
}

export default function ProizvodInput({style, onAdd, proizvods, defaultRabat, disabled, cenas}: ProizvodInputProps) {
  const [proizvod, setProizvod] = React.useState<Proizvod>();
  const [cena, setCena] = useState<Cena>();
  const [kolicina, setKolicina] = React.useState<number>();
  const [komPrice, setKomPrice] = React.useState<number>(100);
  const [kgPrice, setKgPrice] = React.useState<number>(300);
  const [size, setSize] = React.useState<'kom' | 'kg'>('kom');
  const [rabat, setRabat] = React.useState<string>('');

  const [initiallySetRabat, setInitiallySetRabat] = useState<boolean>(false);
  React.useEffect(() => {
    if (defaultRabat && initiallySetRabat) {
      setRabat(defaultRabat.toString());
    }
    return () => { setInitiallySetRabat(true); }
  }, [defaultRabat, initiallySetRabat]);

  const canAdd = !disabled && proizvod && kolicina && rabat !== undefined && ((size === 'kom' && komPrice) || (size === 'kg' && kgPrice));

  const handleProizvodSelect = useCallback((event: SelectChangeEvent<Proizvod>) => {
    const proizvod = event.target.value as Proizvod;
    setProizvod(proizvod);
    const cena = cenas.find(cena => cena.proizvod_id === proizvod.id);
    if (!cena) {
      throw new Error(`Došlo je do greške — ne postoji cena za proizvod ${proizvod.kratko_ime}`);
    }
    setCena(cena);
    setRabat(size === 'kom' ? cena.rabat_kom.toString() : cena.rabat_kg.toString());
  }, [cenas, size]);

  const handleProizvodSizeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const size = event.target.value as 'kom' | 'kg';
    setSize(size);
    if (cena) {
      setRabat(size === 'kom' ? cena.rabat_kom.toString() : cena.rabat_kg.toString());
    }
  }, [setSize, setRabat, cena]);

  const add = useCallback(() => {
    // TODO provera da li ima promena koje treba da se sačuvaju, može da se doda kao parametar u onAdd
    onAdd({
      proizvod_id: proizvod?.id || 0,
      rabat: rabat ? Number(rabat.replace(',', '.')) / 100 : 0,
      kolicina: kolicina || 0,
      cena: (size === 'kom' ? komPrice : kgPrice) || 0,
      rinfuz: size === 'kg',
      na_spisku: 0,
      racun_id: 0
    })
  }, [kgPrice, kolicina, komPrice, onAdd, proizvod?.id, rabat, size]);

  const onRabatChanged = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    let sanitized = event.target.value.replace(',', '.');
    if (sanitized.length && sanitized[sanitized.length - 1] === '.') {
      sanitized = sanitized.substring(0, sanitized.length - 1);
    }
    const newValue = Number(sanitized);
    if (!Number.isNaN(newValue) && newValue > 0 && newValue <= 100) {
      setRabat(event.target.value);
    }
  }, [setRabat]);

  return <div style={{...style, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', padding: 10, gap: 10}}>
    <FormControl disabled={disabled}>
      <InputLabel id='proizvod-select-label' size='small'>Proizvod</InputLabel>
      <Select size='small'
              style={{minWidth: 150}}
              labelId='proizvod-select-label'
              label='Proizvod'
              value={proizvod || ''}
              onChange={handleProizvodSelect}>
        {proizvods?.map(proizvod => {
          // @ts-ignore
          return <MenuItem key={proizvod.id} value={proizvod}>{proizvod.kratko_ime}</MenuItem>;
        })}
      </Select>
    </FormControl>
    <NumberField label='Količina'
               size='small'
               onChange={setKolicina}
               disabled={disabled}
               style={{width: 100}}/>
    <TextField
      disabled={disabled}
      label='Rabat'
      value={rabat}
      style={{width: 100}}
      size='small'
      InputProps={{
        endAdornment: <InputAdornment position='end'>%</InputAdornment>
      }}
      onChange={onRabatChanged}
    />
    <RadioGroup row onChange={handleProizvodSizeChange} value={size}>
      <FormControlLabel value={'kom'} control={<Radio size='small' disabled={disabled}/>} label="Kom"/>
      <NumberField size='small'
                   onChange={setKomPrice}
                   initialValue={100}
                   disabled={disabled || size !== 'kom'}
                   label={'Cena (kom)'}
                   style={{width: 120}}></NumberField>
      <FormControlLabel value={'kg'} control={<Radio size='small' style={{marginLeft: 10}} disabled={disabled}/>} label="Kg"/>
      <NumberField size='small'
                   disabled={disabled || size !== 'kg'}
                   onChange={setKgPrice}
                   label={'Cena (kg)'}
                   initialValue={300}
                   style={{width: 120}}></NumberField>
    </RadioGroup>
    <Button size='small' variant='contained' disabled={!canAdd} onClick={add}>Dodaj proizvod</Button>
  </div>
}
