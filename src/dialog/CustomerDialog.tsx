import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    TextField,
    Typography
} from '@mui/material';
import Customer from '../data/Customer.ts';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import CloseIcon from '@mui/icons-material/Close';
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import * as PriceDao from '../data/supabase/PriceDao.ts';
import Price from '../data/Price.ts';
import {useRepository} from '../repository/Repository.tsx';

export interface CustomerDialogProps {
    open: boolean;
    existingCustomer?: Customer;
    onClose: (customer?: Customer, prices?: Price[]) => void;
}

export default function CustomerDialog({open, existingCustomer, onClose}: CustomerDialogProps) {

    const {products: allProducts} = useRepository();
    const activeProducts = useMemo(() => allProducts.filter(product => product.active), [allProducts]);

    const [name, setName] = React.useState<string>('');
    const [address, setAddress] = React.useState<string>('');
    const [tin, setTin] = React.useState<string>('');
    const [idNo, setIdNo] = React.useState<string>('');
    const [accountNo, setAccountNo] = React.useState<string>('');
    const [paymentPeriod, setPaymentPeriod] = React.useState<number>(30);
    const [deliveryName, setDeliveryName] = React.useState<string>('');
    const [deliveryStreet, setDeliveryStreet] = React.useState<string>('');
    const [deliveryCity, setDeliveryCity] = React.useState<string>('');
    const [active, setActive] = React.useState<boolean>(true);
    const [prices, setPrices] = useState<Price[]>([]);

    // 1. Hides the prices for inactive products, 2. Ensures that each active product has a price entry
    const filterAndFillPricing: (pricingInput: Price[]) => Price[] = useCallback((pricingInput: Price[]) => {
        return activeProducts.map(product => {
            return pricingInput.find(price => price.product_id === product.id) ?? {
                customer_id: existingCustomer?.id ?? 0,
                product_id: product.id,
                piece: 0,
                kg: 0,
                discount_piece: 0,
                discount_kg: 0
            }
        });
    }, [activeProducts, existingCustomer?.id]);

    useEffect(() => {
        if (open) {
            setName(existingCustomer?.name ?? '');
            setAddress(existingCustomer?.address ?? '');
            setTin(existingCustomer?.tin ?? '');
            setIdNo(existingCustomer?.id_no ?? '');
            setAccountNo(existingCustomer?.account_no ?? '');
            setPaymentPeriod(existingCustomer?.payment_period ?? 30);
            setDeliveryName(existingCustomer?.delivery_name ?? '');
            setDeliveryStreet(existingCustomer?.delivery_street ?? '');
            setDeliveryCity(existingCustomer?.delivery_city ?? '');
            setActive(existingCustomer?.active ?? true);
            if (existingCustomer) {
                PriceDao.getForCustomer(existingCustomer).then(prices => {
                    const pricing = filterAndFillPricing(prices);
                    setPrices(pricing);
                });
            } else {
                setPrices(filterAndFillPricing([]));
            }
        }
    }, [existingCustomer, filterAndFillPricing, open]);

    const onSave = useCallback(() => {
        const customerToSave: Customer = {
            id: existingCustomer?.id ?? 0,
            name,
            address,
            tin,
            id_no: idNo,
            account_no: accountNo,
            payment_period: paymentPeriod,
            delivery_name: deliveryName,
            delivery_street: deliveryStreet,
            delivery_city: deliveryCity,
            active,
            balance: existingCustomer?.balance ?? 0
        }

        onClose(customerToSave, prices);
    }, [accountNo, active, address, deliveryCity, deliveryName, deliveryStreet, existingCustomer?.balance, existingCustomer?.id, idNo, name, onClose, paymentPeriod, prices, tin]);

    function processRowUpdate(newPrice: Price) {
        setPrices(prices => {
            return prices.map(price => {
                if (price.product_id === newPrice.product_id) {
                    return newPrice;
                } else {
                    return price;
                }
            });
        });
        return newPrice;
    }

    const pricingColumns: GridColDef[] = useMemo(() => [
            {headerName: 'RB', field: 'product_id'},
            {
                headerName: 'Ime',
                field: 'name',
                valueGetter: (_, row) => activeProducts.find(product => product.id === row.product_id)?.name,
                flex: 2
            },
            {
                headerName: 'Kratko ime',
                field: 'short_name',
                valueGetter: (_, row) => activeProducts.find(product => product.id === row.product_id)?.short_name,
                flex: 1
            },
            {headerName: 'Cena kom', field: 'piece', editable: true, type: 'number'},
            {headerName: 'Cena kg', field: 'kg', editable: true, type: 'number'},
            {headerName: 'Rabat kom', field: 'discount_piece', editable: true, type: 'number'},
            {headerName: 'Rabat kg', field: 'discount_kg', editable: true, type: 'number'}
        ], [activeProducts]);

    return <Dialog open={open}
                   onClose={() => { onClose(); }}
                   fullWidth
                   maxWidth="lg"
                   PaperProps={{
                       style: {
                           minHeight: '90%',
                           maxHeight: '90%',
                       }
                   }}>
        <DialogTitle>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <p style={{margin: 0}}>{existingCustomer?.name ?? 'Novi kupac'}</p>
                <IconButton onClick={() => onClose()}>
                    <CloseIcon/>
                </IconButton>
            </div>
        </DialogTitle>
        <DialogContent style={{padding: 10, overflowY: 'auto'}}>
            <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
                <TextField label="Naziv"
                           value={name}
                           fullWidth
                           onChange={event => setName(event.target.value)} />
                <TextField label="Adresa"
                           value={address}
                           fullWidth
                           onChange={event => setAddress(event.target.value)} />
                <TextField label="PIB"
                           value={tin}
                           fullWidth
                           onChange={event => setTin(event.target.value)} />
                <TextField label="MBR"
                           value={idNo}
                           fullWidth
                           onChange={event => setIdNo(event.target.value)} />
                <TextField label="TKR"
                           value={accountNo}
                           fullWidth
                           onChange={event => setAccountNo(event.target.value)} />
                <TextField label="Valuta"
                           value={paymentPeriod}
                           fullWidth
                           type='number'
                           onChange={event => setPaymentPeriod(Number(event.target.value))} />
                <TextField label="Naziv (otpremljeno)"
                           value={deliveryName}
                           fullWidth
                           onChange={event => setDeliveryName(event.target.value)} />
                <TextField label="Ulica (otpremljeno)"
                           value={deliveryStreet}
                           fullWidth
                           onChange={event => setDeliveryStreet(event.target.value)} />
                <TextField label="Mesto (otpremljeno)"
                           value={deliveryCity}
                           fullWidth
                           onChange={event => setDeliveryCity(event.target.value)} />
                <FormControlLabel label="Aktivan"
                                  control={<Checkbox checked={active}
                                                     onChange={event => setActive(event.target.checked)}/>}
                />

                <Typography variant='h6'>Cene</Typography>
                <Typography variant='caption'>Da bi se izmenila cena, kliknuti dvaput na cenu</Typography>

                <DataGrid
                    columns={pricingColumns}
                    rows={prices}
                    getRowId={row => row.product_id}
                    processRowUpdate={processRowUpdate}
                    hideFooter
                />
            </div>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => onClose()}>Zatvori</Button>
            <Button variant='contained' onClick={onSave}>Sačuvaj izmene</Button>
        </DialogActions>
    </Dialog>
}