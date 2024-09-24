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
import Product from '../data/Product.ts';
import LineItem from '../data/LineItem.ts';
import Price from '../data/Price.ts';

interface ProizvodInputProps {
  style?: React.CSSProperties;
  onAdd: (stProizvod: LineItem) => void;
  onError: (message: string) => void;
  disabled: boolean;
  proizvods?: Product[];
  cenas: Price[];
}

export default function ProizvodInput({style, onAdd, proizvods, disabled, cenas}: ProizvodInputProps) {
  const [proizvod, setProizvod] = React.useState<Product>();
  const [cena, setCena] = useState<Price>();
  const [kolicina, setKolicina] = React.useState<number>();
  const [komPrice, setKomPrice] = React.useState<number>(100);
  const [kgPrice, setKgPrice] = React.useState<number>(300);
  const [size, setSize] = React.useState<'kom' | 'kg'>('kom');
  const [rabat, setRabat] = React.useState<string>('');

  const canAdd = !disabled && proizvod && kolicina && rabat !== undefined && ((size === 'kom' && komPrice) || (size === 'kg' && kgPrice));

  const handleProizvodSelect = useCallback((event: SelectChangeEvent<Product>) => {
    const proizvod = event.target.value as Product;
    setProizvod(proizvod);
    const cena = cenas.find(cena => cena.product_id === proizvod.id);
    if (!cena) {
      throw new Error(`Došlo je do greške — ne postoji cena za proizvod ${proizvod.short_name}`);
    }
    setCena(cena);
    setRabat(size === 'kom' ? cena.discount_piece.toString() : cena.discount_kg.toString());
  }, [cenas, size]);

  const handleProizvodSizeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const size = event.target.value as 'kom' | 'kg';
    setSize(size);
    if (cena) {
      setRabat(size === 'kom' ? cena.discount_piece.toString() : cena.discount_kg.toString());
    }
  }, [setSize, setRabat, cena]);

  const add = useCallback(() => {
    // TODO provera da li ima promena koje treba da se sačuvaju, može da se doda kao parametar u onAdd
    onAdd({
      product_id: proizvod?.id || 0,
      discount_perc: rabat ? Number(rabat.replace(',', '.')) / 100 : 0,
      count: kolicina || 0,
      price: (size === 'kom' ? komPrice : kgPrice) || 0,
      bulk: size === 'kg',
      order_no: 0,
      invoice_no: 0
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
              variant='outlined'
              style={{minWidth: 150}}
              labelId='proizvod-select-label'
              label='Proizvod'
              value={proizvod || ''}
              onChange={handleProizvodSelect}>
        {proizvods?.map(proizvod => {
          // @ts-ignore
          return <MenuItem key={proizvod.id} value={proizvod}>{proizvod.short_name}</MenuItem>;
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
      slotProps={{
        input: {
          endAdornment: <InputAdornment position='end'>%</InputAdornment>
        }
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
