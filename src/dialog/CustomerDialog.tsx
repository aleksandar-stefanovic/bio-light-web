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
import React, {useEffect, useMemo, useState} from 'react';
import CloseIcon from '@mui/icons-material/Close';
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import * as PriceDao from '../data/supabase/PriceDao.ts';
import Price from '../data/Price.ts';
import {useRepository} from '../repository/Repository.tsx';

interface KupacDialogProps {
    open: boolean;
    customer: Customer;
    onClose: (save: boolean) => void;
}

export default function CustomerDialog({open, customer, onClose}: KupacDialogProps) {

    const {products} = useRepository();

    const [name, setName] = React.useState(customer.name);
    const [address, setAddress] = React.useState(customer.address);
    const [tin, setTin] = React.useState(customer.tin);
    const [idNo, setIdNo] = React.useState(customer.id_no);
    const [accountNo, setAccountNo] = React.useState(customer.account_no);
    const [paymentPeriod, setPaymentPeriod] = React.useState(customer.payment_period);
    const [deliveryName, setDeliveryName] = React.useState(customer.delivery_name);
    const [deliveryStreet, setDeliveryStreet] = React.useState(customer.delivery_street);
    const [deliveryCity, setDeliveryCity] = React.useState(customer.delivery_city);
    const [active, setActive] = React.useState(customer.active);
    const [prices, setPrices] = useState<Price[]>([]);

    useEffect(() => {
        if (open) {
            setName(customer.name);
            setAddress(customer.address);
            setTin(customer.tin);
            setIdNo(customer.id_no);
            setAccountNo(customer.account_no);
            setPaymentPeriod(customer.payment_period);
            setDeliveryName(customer.delivery_name);
            setDeliveryStreet(customer.delivery_street);
            setDeliveryCity(customer.delivery_city);
            setActive(customer.active);
            PriceDao.getForCustomer(customer).then(prices => {
                setPrices(prices)
            })
        }
    }, [customer, open, products]);

    const pricingColumns: GridColDef[] = useMemo(() => [
        {headerName: 'RB', field: 'product_id'},
        {headerName: 'Ime', field: 'name', valueGetter: (_, row) => products.find(product => product.id === row.product_id)?.name, flex: 2},
        {headerName: 'Kratko ime', field: 'short_name', valueGetter: (_, row) => products.find(product => product.id === row.product_id)?.short_name, flex: 1},
        {headerName: 'Cena kom', field: 'piece', editable: true},
        {headerName: 'Cena kg', field: 'kg', editable: true},
        {headerName: 'Rabat kom', field: 'discount_piece', editable: true},
        {headerName: 'Rabat kg', field: 'discount_kg', editable: true}
    ], [products]);

    return <Dialog open={open}
                   onClose={onClose}
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
                <p style={{margin: 0}}>{customer.name}</p>
                <IconButton onClick={() => onClose(false)}>
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
                    hideFooter
                />
            </div>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => onClose(false)}>Zatvori</Button>
            <Button disabled variant='contained'>Sačuvaj izmene</Button>
        </DialogActions>
    </Dialog>
}