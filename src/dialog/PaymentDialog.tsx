import Payment from '../data/Payment.ts';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, TextField} from '@mui/material';
import Customer from '../data/Customer.ts';
import {ChangeEvent, useCallback, useEffect, useState} from 'react';
import CustomerPickerDialog from './CustomerPickerDialog.tsx';
import {useRepository} from '../repository/Repository.tsx';
import {DatePicker} from '@mui/x-date-pickers';
import dayjs, {Dayjs} from 'dayjs';
import Invoice from '../data/Invoice.ts';
import InvoicePickerDialog from './InvoicePickerDialog.tsx';

export interface PaymentDialogProps {
    open: boolean;
    existingPayment?: Payment; // Provide this parameter when editing an existing payment
    intent: 'create'|'edit';
    onClose: (confirmed: boolean, intent: 'create'|'edit', payment?: Payment) => void;
}

export default function PaymentDialog({open, existingPayment, intent, onClose}: PaymentDialogProps) {

    const {customers, payments} = useRepository();

    const [customer, setCustomer] = useState<Customer | undefined>(customers.find(customer => customer.id === existingPayment?.customer_id));
    const [date, setDate] = useState<Dayjs>(dayjs());
    const [invoice, setInvoice] = useState<Invoice>(); // Invoice that this invoice pays
    const [amountString, setAmountString] = useState<string>('');
    const [customerPickerOpen, setCustomerPickerOpen] = useState(false);
    const [invoicePickerOpen, setInvoicePickerOpen] = useState(false);
    const [amountFieldHasErrors, setAmountFieldHasErros] = useState(false);

    useEffect(() => {
        // Set the date to the date of the last payment, as payments are ingested ordered by the date
        setDate(dayjs(payments[0]?.date))
    }, [payments]);

    const onCustomerPickerDialogClose = useCallback(() => {
        setCustomerPickerOpen(false);
    }, []);

    /*
     * defined → set the value,
     * undefined → picker dialog closed without result,
     * null → picker closed with intent to unset the selected invoice
     */
    const onInvoicePickerDialogClose = useCallback((invoice: Invoice | null | undefined) => {
        if (invoice) {
            setInvoice(invoice);
            setAmountString(invoice.amount.toFixed(2).replace('.', ','));
        } else if (invoice === null) {
            setInvoice(undefined);
        }
        setInvoicePickerOpen(false);
    }, []);

    const parseAmountString = useCallback((str: string) => {
        return Number(str.replace(',', '.').replace(/\s/, ''))
    }, []);

    const validateAmountInput = useCallback((str: string = amountString) => {
        const hasErrors = isNaN(parseAmountString(str));
        setAmountFieldHasErros(hasErrors);
        return hasErrors;
    }, [amountString, parseAmountString]);

    const onAmountStringChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setAmountString(event.target.value);

        // As long as there are errors in the input, re-run validation check, for a faster feedback info and better UX
        if (amountFieldHasErrors) {
            validateAmountInput(event.target.value);
        }
    }, [amountFieldHasErrors, validateAmountInput]);

    const onCustomerSelected = useCallback((customer: Customer) => {
        setCustomer(customer);
        onCustomerPickerDialogClose();
    }, [onCustomerPickerDialogClose]);

    const onConfirm = useCallback(() => {
        validateAmountInput();
        if (!amountFieldHasErrors && customer) {
            const payment: Payment = {
                id: existingPayment?.id ?? 0,
                customer_id: customer.id,
                date: date.toDate(),
                amount: parseAmountString(amountString),
                invoice_id: invoice?.id,
                balance: 0
            };
            onClose(true, intent, payment);
        }
    }, [amountFieldHasErrors, amountString, customer, date, existingPayment?.id, intent, invoice?.id, onClose, parseAmountString, validateAmountInput]);

    const readyToSave = customer && parseAmountString(amountString) > 0 && date;

    return <Dialog open={open} onClose={() => { onClose(false, intent) }} maxWidth='sm' fullWidth>
        <DialogTitle>{intent === 'create' ? 'Nova uplata' : 'Izmena uplate'}</DialogTitle>
        <DialogContent style={{display: 'flex', flexDirection: 'column', gap: 10}}>
            <TextField value={customer?.name ?? ''}
                       contentEditable={false}
                       slotProps={{
                           input: {
                               endAdornment: <InputAdornment position='end'><Button onClick={() => { setCustomerPickerOpen(true); }}>Izaberi kupca</Button></InputAdornment>
                           }
                       }}
            />
            <DatePicker
                label='Datum uplate'
                value={date}
                format={'DD.MM.YYYY.'}
                onChange={(newValue) => {
                    if (newValue) {
                        setDate(date);
                    }
                }}
            />
            <TextField
                label='Na osnovu računa'
                value={invoice?.ref_no ?? ''}
                slotProps={{
                    input: {
                        endAdornment: <InputAdornment position='end'><Button onClick={() => { setInvoicePickerOpen(true); }}>Izaberi račun</Button></InputAdornment>
                    }
                }}
            />
            <TextField
                label='Iznos'
                value={amountString}
                onChange={(event) => { onAmountStringChange(event); }}
                onBlur={() => { validateAmountInput(); }}
                error={amountFieldHasErrors}
                helperText={amountFieldHasErrors ? 'Greška u iznosu' : ' '}
            />

        </DialogContent>
        <DialogActions>
            <Button onClick={() => onClose(false, intent)}>Otkaži</Button>
            <Button onClick={onConfirm} disabled={!readyToSave}>Sačuvaj</Button>
        </DialogActions>
        <CustomerPickerDialog open={customerPickerOpen} onSelectCustomer={onCustomerSelected} onClose={onCustomerPickerDialogClose} />
        {customer && <InvoicePickerDialog open={invoicePickerOpen} customer={customer} onClose={onInvoicePickerDialogClose} />}
    </Dialog>
}

