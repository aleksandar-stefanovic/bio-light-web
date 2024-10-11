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
import {useTranslation} from 'react-i18next';

interface ProductInputProps {
  style?: React.CSSProperties;
  onAdd: (lineItem: LineItem) => void;
  onError: (message: string) => void;
  disabled: boolean;
  customerPrices: Price[];
}

export default function ProductInput({style, onAdd, disabled, customerPrices}: ProductInputProps) {

  const {products: allProducts} = useRepository();
  const products = allProducts.filter(product => product.active);

  const {t} = useTranslation();

  const [selectedProduct, setSelectedProduct] = React.useState<Product>();
  const [defaultPrice, setDefaultPrice] = useState<Price>();
  const [count, setCount] = React.useState<number>();
  const [piecePrice, setPiecePrice] = React.useState<number>(0);
  const [kgPrice, setKgPrice] = React.useState<number>(0);
  const [bulk, setBulk] = React.useState<boolean>(false);
  const [discount, setDiscount] = React.useState<string>('');

  const canAdd = !disabled && selectedProduct && count && discount != null && ((!bulk && piecePrice) || (bulk && kgPrice));

  const handleProductSelect = useCallback((event: SelectChangeEvent<number>) => {
    const productId = event.target.value;
    const product = products.find(product => product.id === productId)!;
    setSelectedProduct(product);
    const price = customerPrices.find(price => price.product_id === product.id)!;
    setDefaultPrice(price);
    setPiecePrice(price.piece);
    setKgPrice(price.kg);
    setDiscount(bulk ? price.discount_kg.toString() : price.discount_piece.toString());
  }, [products, customerPrices, bulk]);

  const handleProductBulkChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const isBulk = event.target.value === 'true';
    setBulk(isBulk);
    if (defaultPrice) {
      setDiscount(isBulk ? defaultPrice.discount_kg.toString() : defaultPrice.discount_piece.toString());
    }
  }, [setBulk, setDiscount, defaultPrice]);

  const add = useCallback(() => {
    if (canAdd) {
      const discountPerc = discount ? Number(discount.replace(',', '.')) : 0;
      const discountFrac = discountPerc / 100;
      const ppu = bulk ? kgPrice : piecePrice;
      const amountBeforeDiscount = ppu * count;
      const amount = amountBeforeDiscount * (1 - discountFrac);
      const ean = bulk ? selectedProduct.ean_kg : selectedProduct.ean;
      const name = selectedProduct.name + ' ' + (bulk ? selectedProduct.suffix_kg : selectedProduct.suffix_piece);
      const unit = bulk ? 'kg' : 'kom'; // This is hardcoded as such, but is probably sufficient for now
      onAdd({
        product_id: selectedProduct.id,
        discount_perc: discountPerc,
        count,
        amount,
        amount_before_discount: amountBeforeDiscount,
        price: ppu,
        unit,
        bulk,
        order_no: 0,
        invoice_id: 0,
        ean,
        name,
      });
    }
  }, [canAdd, discount, bulk, kgPrice, piecePrice, count, selectedProduct, onAdd]);

  const onDiscountChanged = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
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
      <InputLabel id='product-select-label' size='small'>{t('product')}</InputLabel>
      <Select size='small'
              variant='outlined'
              style={{minWidth: 150}}
              labelId='product-select-label'
              label={t('product')}
              value={selectedProduct?.id ?? ''}
              onChange={handleProductSelect}>
        {products?.map(product => {
          return <MenuItem key={product.id} value={product.id}>{product.short_name}</MenuItem>;
        })}
      </Select>
    </FormControl>
    <NumberField label={t('amount')}
                 size='small'
                 onChange={setCount}
                 disabled={disabled}
                 style={{width: 100}}/>
    <TextField
        disabled={disabled}
        label={t('discountRebate')}
        value={discount}
        style={{width: 100}}
        size='small'
        slotProps={{
          input: {
            endAdornment: <InputAdornment position='end'>%</InputAdornment>
          }
        }}
        onChange={onDiscountChanged}
    />
    <RadioGroup row onChange={handleProductBulkChange} value={bulk ? 'true' : 'false'}>
      <FormControlLabel value={'false'} control={<Radio size='small' disabled={disabled}/>} label='Kom'/>
      <TextField size='small'
                 value={piecePrice}
                 type='number'
                 onChange={(event) => {
                   setPiecePrice(Number(event.target.value))
                 }}
                 disabled={disabled || bulk}
                 label={t('pricePiece')}
                 style={{width: 120}}></TextField>
      <FormControlLabel value={'true'} control={<Radio size='small' style={{marginLeft: 10}} disabled={disabled}/>}
                        label='Kg'/>
      <TextField size='small'
                 type='number'
                 disabled={disabled || !bulk}
                 value={kgPrice}
                 onChange={(event) => {
                   setKgPrice(Number(event.target.value))
                 }}
                 label={t('priceBulk')}
                 style={{width: 120}}></TextField>
    </RadioGroup>
    <Button size='small' variant='contained' disabled={!canAdd} onClick={add}>{t('addProduct')}</Button>
  </div>;
}
