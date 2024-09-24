import Payment from '../data/Payment.ts';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, TextField} from '@mui/material';
import Customer from '../data/Customer.ts';
import {useCallback, useState} from 'react';
import CustomerPickerDialog from './CustomerPickerDialog.tsx';
import {useRepository} from '../repository/Repository.tsx';

export interface PaymentDialogProps {
    open: boolean;
    payment?: Payment; // Provide this parameter when editing an existing payment
    intent: 'create'|'edit';
    onClose: (save: boolean, intent: 'create'|'edit', payment?: Payment) => void;
}

export default function PaymentDialog({open, payment, intent, onClose}: PaymentDialogProps) {

    const {customers} = useRepository();

    const [customer, setCustomer] = useState<Customer | undefined>(customers.find(customer => customer.id === payment?.customer_id));

    const [customerPickerOpen, setCustomerPickerOpen] = useState<boolean>(false);

    const onCustomerPickerDialogClose = useCallback(() => {
        setCustomerPickerOpen(false);
    }, []);

    return <Dialog open={open} onClose={() => { onClose(false, intent) }} maxWidth='lg' fullWidth>
        <DialogTitle>{intent === 'create' ? 'Nova uplata' : 'Izmena uplate'}</DialogTitle>
        <DialogContent style={{display: 'flex', flexDirection: 'column'}}>
            <TextField value={customer?.name ?? ''}
                       contentEditable={false}
                       slotProps={{
                           input: {
                               endAdornment: <InputAdornment position='end'><Button onClick={() => { setCustomerPickerOpen(true); }}>Izaberi kupca</Button></InputAdornment>
                           }
                       }}
            />
        </DialogContent>
        <DialogActions>
            <Button>Otkaži</Button> {/*TODO*/}
            <Button>Sačuvaj</Button> {/*TODO*/}
        </DialogActions>
        <CustomerPickerDialog open={customerPickerOpen} onSelectCustomer={setCustomer} onClose={onCustomerPickerDialogClose} />
    </Dialog>
}

