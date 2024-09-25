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
import {useRepository} from '../repository/Repository.tsx';

interface ProductInputProps {
  style?: React.CSSProperties;
  onAdd: (lineItem: LineItem) => void;
  onError: (message: string) => void;
  disabled: boolean;
  customerPrices: Price[];
}

export default function ProductInput({style, onAdd, disabled, customerPrices}: ProductInputProps) {

  const {products} = useRepository();

  const [selectedProduct, setSelectedProduct] = React.useState<Product>();
  const [price, setPrice] = useState<Price>();
  const [count, setCount] = React.useState<number>();
  const [piecePrice, setPiecePrice] = React.useState<number>(100);
  const [kgPrice, setKgPrice] = React.useState<number>(300);
  const [bulk, setBulk] = React.useState<'kom' | 'kg'>('kom');
  const isBulk = bulk === 'kg'; // Refactor to just use the boolean, instead of strings
  const [discount, setDiscount] = React.useState<string>('');

  const canAdd = !disabled && selectedProduct && count && discount != null && ((bulk === 'kom' && piecePrice) || (bulk === 'kg' && kgPrice));

  const handleProductSelect = useCallback((event: SelectChangeEvent<number>) => {
    const productId = event.target.value;
    const product = products.find(product => product.id === productId)!;
    setSelectedProduct(product);
    const price = customerPrices.find(price => price.product_id === product.id);
    if (!price) {
      throw new Error(`Došlo je do greške — ne postoji cena za proizvod ${product.short_name}`);
    }
    setPrice(price);
    setDiscount(bulk === 'kom' ? price.discount_piece.toString() : price.discount_kg.toString());
  }, [products, customerPrices, bulk]);

  const handleProductBulkChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const size = event.target.value as 'kom' | 'kg';
    setBulk(size);
    if (price) {
      setDiscount(size === 'kom' ? price.discount_piece.toString() : price.discount_kg.toString());
    }
  }, [setBulk, setDiscount, price]);

  const add = useCallback(() => {
    // TODO check whether pricing/discount is different than the default for that customer, and offer to update it if so
    if (canAdd) {
      const discountPerc = discount ? Number(discount.replace(',', '.')) : 0;
      const discountFrac = discountPerc / 100;
      const ppu = isBulk ? kgPrice : piecePrice;
      const amountBeforeDiscount = ppu * count;
      const amount = amountBeforeDiscount * (1 - discountFrac);
      const ean = isBulk ? selectedProduct.ean_kg : selectedProduct.ean;
      const name = selectedProduct.name + ' ' + (isBulk ? selectedProduct.suffix_kg : selectedProduct.suffix_piece);
      const unit = isBulk ? 'kg' : 'kom'; // This is hardcoded as such, but is probably sufficient for now
      onAdd({
        product_id: selectedProduct.id,
        discount_perc: discountPerc,
        count,
        amount,
        amount_before_discount: amountBeforeDiscount,
        price: ppu,
        unit,
        bulk: isBulk,
        order_no: 0,
        invoice_no: 0,
        ean,
        name,
      });
    }
  }, [canAdd, discount, isBulk, kgPrice, piecePrice, count, selectedProduct, onAdd]);

  const onRabatChanged = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    let sanitized = event.target.value.replace(',', '.');
    if (sanitized.length && sanitized[sanitized.length - 1] === '.') {
      sanitized = sanitized.substring(0, sanitized.length - 1);
    }
    const newValue = Number(sanitized);
    if (!Number.isNaN(newValue) && newValue > 0 && newValue <= 100) {
      setDiscount(event.target.value);
    }
  }, [setDiscount]);

  return <div style={{...style, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', padding: 10, gap: 10}}>
    <FormControl disabled={disabled}>
      <InputLabel id='product-select-label' size='small'>Proizvod</InputLabel>
      <Select size='small'
              variant='outlined'
              style={{minWidth: 150}}
              labelId='product-select-label'
              label='Proizvod'
              value={selectedProduct?.id ?? ''}
              onChange={handleProductSelect}>
        {products?.map(product => {
          return <MenuItem key={product.id} value={product.id}>{product.short_name}</MenuItem>;
        })}
      </Select>
    </FormControl>
    <NumberField label='Količina'
               size='small'
               onChange={setCount}
               disabled={disabled}
               style={{width: 100}}/>
    <TextField
      disabled={disabled}
      label='Rabat'
      value={discount}
      style={{width: 100}}
      size='small'
      slotProps={{
        input: {
          endAdornment: <InputAdornment position='end'>%</InputAdornment>
        }
      }}
      onChange={onRabatChanged}
    />
    <RadioGroup row onChange={handleProductBulkChange} value={bulk}>
      <FormControlLabel value={'kom'} control={<Radio size='small' disabled={disabled}/>} label="Kom"/>
      <NumberField size='small'
                   onChange={setPiecePrice}
                   initialValue={100}
                   disabled={disabled || bulk !== 'kom'}
                   label={'Cena (kom)'}
                   style={{width: 120}}></NumberField>
      <FormControlLabel value={'kg'} control={<Radio size='small' style={{marginLeft: 10}} disabled={disabled}/>} label="Kg"/>
      <NumberField size='small'
                   disabled={disabled || bulk !== 'kg'}
                   onChange={setKgPrice}
                   label={'Cena (kg)'}
                   initialValue={300}
                   style={{width: 120}}></NumberField>
    </RadioGroup>
    <Button size='small' variant='contained' disabled={!canAdd} onClick={add}>Dodaj proizvod</Button>
  </div>
}
