import {DataGrid, GridColDef} from '@mui/x-data-grid';
import {Button, Checkbox, FormControlLabel, IconButton, InputAdornment, TextField} from '@mui/material';
import {DatePicker} from '@mui/x-date-pickers';
import CloseIcon from '@mui/icons-material/Close';
import {useCallback, useEffect, useMemo, useState} from 'react';
import CustomerPickerDialog from '../dialog/CustomerPickerDialog.tsx';
import ProductInput from '../component/ProductInput.tsx';
import TabProps from './TabProps';
import LineItem from '../data/LineItem.ts';
import Invoice from '../data/Invoice.ts';
import lodash from 'lodash';
import Customer from '../data/Customer.ts';
import {useGlobalState} from "../GlobalStateProvider";
import * as PriceDao from '../data/supabase/PriceDao.ts';
import Price from '../data/Price.ts';
import {Dayjs} from 'dayjs';
import dayjs from 'dayjs';
import LineItemDao from '../data/supabase/LineItemDao.ts';
import {useRepository} from '../repository/Repository.tsx';

const _ = lodash;

interface TabCreateInvoiceProps extends TabProps {
    nextInvoiceNo: string;
    onInvoiceSave: (invoice: Invoice) => Promise<void>;
    existingInvoice?: Invoice; // Set this when editing an existing invoice
}

export default function TabCreateInvoice({style, visible, showSnackbar, nextInvoiceNo, onInvoiceSave, existingInvoice}: TabCreateInvoiceProps) {
    const [, setGlobalState] = useGlobalState();

    const {customers} = useRepository();

    const [lineItems, setLineItems] = useState<LineItem[]>([]);
    const amount_before_discount = _.sum(lineItems.map(p => p.price * p.count));
    const discount = _.sum(lineItems.map(p => p.price * p.count * p.discount_perc));
    const amount = _.sum(lineItems.map(p => p.price * p.count * (1 - p.discount_perc)));

    const onLineItemAdd = useCallback(async (lineItem: LineItem) => {
        lineItem.order_no = !_.isEmpty(lineItems) ? Math.max(...lineItems.map(p => p.order_no)) + 1 : 1;
        setLineItems(oldRows => [...oldRows, lineItem]);
    }, [lineItems, setLineItems]);

    const removeRow = useCallback((order_no: number) => {
        setLineItems(oldRows => {
            return oldRows
            .filter(lineItem => lineItem.order_no !== order_no)
            .map((lineItem, index) => {
                lineItem.order_no = index + 1;
                return lineItem;
            });
        });
    }, [setLineItems]);

    const lineItemColumns: GridColDef[] = useMemo(() => [
        {field: 'order_no', headerName: 'RB', width: 50},
        {field: 'name', headerName: 'Naziv', flex: 1,},
        {field: 'count', headerName: 'Količina', width: 100},
        {field: 'unit', headerName: 'JM', width: 50},
        {field: 'price', headerName: 'Cena', width: 100, valueGetter: value => Number(value).toFixed(2)},
        {field: 'discount_perc', headerName: 'Rabat', width: 100, valueGetter: (value) => value + '%'},
        {field: 'amount', headerName: 'Osnovica', width: 100, valueGetter: value => Number(value).toFixed(2)},
        {field: 'amount_before_discount', headerName: 'Vrednost', width: 100, valueGetter: value => Number(value).toFixed(2)},
        {
            field: 'Izbriši',
            width: 100,
            renderCell: (params) => {
                return (
                    <IconButton onClick={() => removeRow(params.row.order_no)}>
                        <CloseIcon/>
                    </IconButton>
                );
            }
        }
    ], [removeRow]);

    const [invoiceDate, setInvoiceDate] = useState<Dayjs>(dayjs(existingInvoice?.date));

    const [paymentPeriod, setPaymentPeriod] = useState<string>(() => {
        if (existingInvoice) {
            const dayDifference = dayjs(existingInvoice.date_due).diff(dayjs(existingInvoice.date), 'day');
            return dayDifference.toString();
        } else {
            return '30';
        }
    });

    const dateDue = useMemo(() => {
        const paymentPeriodNumber = !isNaN(Number(paymentPeriod)) ? Number(paymentPeriod) : 30
        return invoiceDate.add(paymentPeriodNumber, 'day');
    }, [invoiceDate, paymentPeriod]);

    const paymentPeriodString = dateDue.format('DD.MM.YYYY.');

    const [customer, setCustomer] = useState<Customer>();
    const [customerPickerDialogOpen, setCustomerDialogPickerOpen] = useState(false);
    const [customerPrices, setCustomerPrices] = useState<Price[]>([]);

    useEffect(() => {
        if (visible && existingInvoice) {
            setCustomer(customers.find(customer => customer.id === existingInvoice.customer_id));
            LineItemDao.getByInvoiceId(existingInvoice.id).then(lineItems => {
                setLineItems(lineItems);
            });

        }
    }, [existingInvoice, customers, visible]);

    useEffect(() => {
        if (customer) {
            PriceDao.getForCustomer(customer).then(prices => {
                setCustomerPrices(prices);
            });
        }
    }, [customer, setCustomerPrices]);

    const onSelectCustomer = useCallback((customer: Customer) => {
        setCustomer(customer);
        setCustomerDialogPickerOpen(false);
    }, [setCustomer, setCustomerDialogPickerOpen]);

    const cleanup = useCallback(() => {
        setCustomer(undefined);
        setLineItems([]);
        setGlobalState({invoiceToPrint: undefined});
    }, [setCustomer, setLineItems, setGlobalState]);

    const saveInvoice = useCallback(async () => {
        if (customer) {
            const invoice: Invoice = {
                id: existingInvoice?.id ?? 0,
                date: invoiceDate.toDate(),
                date_due: dateDue.toDate(),
                ref_no: existingInvoice?.ref_no ?? nextInvoiceNo,
                customer_id: customer.id,
                lineItems: lineItems,
                amount_before_discount: amount_before_discount,
                discount: discount,
                amount: amount,
                balance: customer.balance + amount // This only works for new invoices, the logic works differently for edited ones
            };
            setGlobalState({invoiceToPrint: {invoice, customer}});
            setTimeout(async () => {
                try {
                    await onInvoiceSave(invoice);
                    window.print();
                    showSnackbar('success', 'Otpremnica zatvorena');
                } catch (error) {
                    console.error(error);
                    showSnackbar('error', 'Greška pri čuvanju otpremnice');
                } finally {
                    cleanup();
                }
            }, 500);
        }
    }, [customer, existingInvoice?.id, existingInvoice?.ref_no, invoiceDate, dateDue, nextInvoiceNo, lineItems, amount_before_discount, discount, amount, setGlobalState, onInvoiceSave, showSnackbar, cleanup]);

    return <div style={{...style, display: visible ? 'flex' : 'none', flexDirection: 'row', height: '100%'}}>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', height: '100%'}}>
            <ProductInput
                onAdd={onLineItemAdd}
                onError={(message) => showSnackbar('error', message)}
                disabled={!customer}
                customerPrices={customerPrices}/>
            <div style={{flexGrow: 1, minHeight: 50}}>
                <DataGrid
                    rows={lineItems}
                    columns={lineItemColumns}
                    hideFooter
                    getRowId={(lineItem) => lineItem.order_no}/>
            </div>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 10, padding: 10}}>
            {visible}
            <Button variant='outlined' onClick={() => setCustomerDialogPickerOpen(true)}>Izaberi kupca</Button>
            <CustomerPickerDialog open={customerPickerDialogOpen}
                                  onSelectCustomer={onSelectCustomer}
                                  onClose={() => setCustomerDialogPickerOpen(false)} />
            <TextField label='Kupac' value={customer?.name || ''}/>
            <TextField label='Broj računa' value={nextInvoiceNo} slotProps={{htmlInput: {readOnly: true}}}/>
            <DatePicker
                label="Datum računa"
                value={invoiceDate}
                format={'DD.MM.YYYY.'}
                onChange={(newValue) => {
                    if (newValue) {
                        setInvoiceDate(newValue)
                    }
                }}
            />
            <TextField
                label='Valuta'
                value={paymentPeriod}
                onChange={(event) => setPaymentPeriod(event.target.value)}
                slotProps={{input: {endAdornment: <InputAdornment position="end">dana</InputAdornment>}}}
            />
            <TextField
                label='Datum valute'
                value={paymentPeriodString}
            />
            <TextField
                label='Iznos'
                value={amount_before_discount.toFixed(2)}
            />
            <TextField
                label='Popust'
                value={discount.toFixed(2)}
            />
            <TextField
                label='Za uplatu'
                value={amount.toFixed(2)}
            />
            <Button variant='contained' size='large' onClick={saveInvoice}>{existingInvoice ? 'Sačuvaj račun' : 'Zatvori račun'}</Button>
            <FormControlLabel control={<Checkbox/>} label="Stavi pečat i potpis" disabled/>
        </div>
    </div>;
}
