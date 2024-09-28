import Invoice, {InvoiceId} from '../data/Invoice.ts';
import {useRepository} from '../repository/Repository.tsx';
import Customer from '../data/Customer.ts';
import {useCallback, useMemo, useState} from 'react';
import {Button, Dialog, DialogActions, DialogContent} from '@mui/material';
import {DataGrid, GridColDef, GridRowSelectionModel} from '@mui/x-data-grid';
import dayjs from 'dayjs';

export interface InvoicePickerDialogProps {
    open: boolean;
    customer: Customer;
    onClose: (invoice: Invoice | null | undefined) => void;
}

/**
 * This dialog is used to select a specific invoice for a payment
 */
export default function InvoicePickerDialog({open, customer, onClose}: InvoicePickerDialogProps) {
    const {invoices, payments} = useRepository();

    // Attribute of an invoice being paid could be stored in the database as well, just to avoid this calculation
    const paidInvoiceIdSet: Set<InvoiceId> = useMemo(() => {
        const set = new Set<InvoiceId>();
        if (open) {
            payments.filter(payment => {
                return payment.invoice_id != null && payment.customer_id === customer.id
            })
            .forEach(payment => {
                set.add(payment.invoice_id!);
            });
        }
        return set;
    }, [customer.id, open, payments]);

    const filteredInvoices = invoices.filter(invoice => {
        return !paidInvoiceIdSet.has(invoice.id) && invoice.customer_id === customer.id;
    });

    const [selectedInvoice, setSelectedInvoice] = useState<Invoice>();

    const onInvoiceSelected = useCallback(([invoiceId]: GridRowSelectionModel) => {
        const invoice = filteredInvoices.find(invoice => invoice.id === invoiceId);
        if (invoice) {
            setSelectedInvoice(invoice);
        }
    }, [filteredInvoices]);

    const columns: GridColDef[] = [
        {field: 'ref_no', headerName: 'RB'},
        {field: 'date', headerName: 'Datum', valueGetter: (value) => dayjs(value).format('DD.MM.YYYY.')},
        {field: 'date_due', headerName: 'Datum valute', valueGetter: (value) => dayjs(value).format('DD.MM.YYYY.')},
        {
            field: 'amount',
            headerName: 'Iznos',
            valueGetter: value => Number(value).toFixed(2),
            align: 'right',
            headerAlign: 'right'
        },
    ]


    return <Dialog
        open={open}
        fullWidth
        maxWidth="sm"
    >
        <DialogContent>
            <DataGrid
                columns={columns}
                rows={filteredInvoices}
                onRowSelectionModelChange={onInvoiceSelected}
                onRowDoubleClick={() => { onClose(selectedInvoice); }}
                hideFooter
            />
        </DialogContent>

        <DialogActions>
            <Button variant='outlined' onClick={() => { onClose(undefined); }}>Zatvori</Button>
            <Button variant='outlined' onClick={() => { onClose(null); }}>Ukloni izbor</Button>
            <Button variant='outlined' onClick={() => { onClose(selectedInvoice); }}>Izaberi</Button>
        </DialogActions>
    </Dialog>;
};