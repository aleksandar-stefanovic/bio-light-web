import {DataGrid, GridColDef} from '@mui/x-data-grid';
import {Button, IconButton, InputAdornment, TextField} from '@mui/material';
import {DatePicker} from '@mui/x-date-pickers';
import CloseIcon from '@mui/icons-material/Close';
import {useCallback, useEffect, useMemo, useState} from 'react';
import CustomerPickerDialog from '../dialog/CustomerPickerDialog.tsx';
import ProductInput from '../component/ProductInput.tsx';
import TabProps from './TabProps';
import LineItem from '../data/LineItem.ts';
import Invoice from '../data/Invoice.ts';
import _ from 'lodash';
import Customer from '../data/Customer.ts';
import {useGlobalState} from "../GlobalStateProvider";
import * as PriceDao from '../data/supabase/PriceDao.ts';
import Price from '../data/Price.ts';
import {Dayjs} from 'dayjs';
import dayjs from 'dayjs';
import LineItemDao from '../data/supabase/LineItemDao.ts';
import {useRepository} from '../repository/Repository.tsx';
import PriceChangeDialog, {PriceChangeDialogProps} from '../dialog/PriceChangeDialog.tsx';

interface TabCreateInvoiceProps extends TabProps {
    existingInvoice?: Invoice; // Set this when editing an existing invoice
    onSaved?: () => void;
}

export default function TabCreateInvoice({style, visible, showSnackbar, existingInvoice, onSaved}: TabCreateInvoiceProps) {
    const [, setGlobalState] = useGlobalState();

    const {customers, insertInvoice, updateInvoice, nextInvoiceRefNo, updatePrices} = useRepository();
    const invoiceRefNo = existingInvoice?.ref_no ?? nextInvoiceRefNo;

    const [lineItems, setLineItems] = useState<LineItem[]>([]);
    const amount_before_discount = _.sum(lineItems.map(p => p.price * p.count));
    const discount = _.sum(lineItems.map(p => p.price * p.count * p.discount_perc / 100));
    const amount = _.sum(lineItems.map(p => p.price * p.count * (1 - p.discount_perc / 100)));

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

    const detectChangedPrices = useCallback((lineItems: LineItem[]) => {
        const changedPrices: {oldPrice: Price, newPrice: Price}[] = [];
        lineItems.forEach(lineItem => {
            const price = customerPrices.find(price => price.product_id === lineItem.product_id)!;
            if (lineItem.bulk) {
                if (lineItem.price !== price.kg || lineItem.discount_perc !== price.discount_kg) {
                    const newPrice: Price = {
                        ...price,
                        kg: lineItem.price,
                        discount_kg: lineItem.discount_perc
                    }
                    changedPrices.push({oldPrice: price, newPrice});
                }
            } else {
                if (lineItem.price !== price.piece || lineItem.discount_perc !== price.discount_piece) {
                    const newPrice: Price = {
                        ...price,
                        piece: lineItem.price,
                        discount_piece : lineItem.discount_perc
                    }
                    changedPrices.push({oldPrice: price, newPrice});
                }
            }
        });

        return changedPrices;
    }, [customerPrices]);

    const [priceChangeDialogProps, setPriceChangeDialogProps] = useState<PriceChangeDialogProps>({
        open: false,
        changes: [],
        onClose: () => {}
    });

    const saveInvoice = useCallback(async () => {
        if (customer) {
            const invoice: Invoice = {
                id: existingInvoice?.id ?? 0,
                date: invoiceDate.toDate(),
                date_due: dateDue.toDate(),
                ref_no: invoiceRefNo,
                customer_id: customer.id,
                amount_before_discount: amount_before_discount,
                discount: discount,
                amount: amount,
                balance: 0 // This will be recalculated upon storing
            };
            setGlobalState({invoiceToPrint: {invoice, customer, lineItems}});
            setTimeout(async () => {
                try {
                    if (existingInvoice) {
                        const customerChanged = existingInvoice.customer_id !== customer.id;
                        if (customerChanged) {
                            await updateInvoice(invoice, lineItems, existingInvoice.customer_id);
                        } else {
                            await updateInvoice(invoice, lineItems);
                        }
                    } else {
                        await insertInvoice(invoice, lineItems);
                    }
                    window.print();
                    showSnackbar('success', 'Otpremnica zatvorena');

                    const changedPrices = detectChangedPrices(lineItems);
                    if (changedPrices.length > 0) {
                        setPriceChangeDialogProps({
                            open: true,
                            changes: changedPrices,
                            onClose: async(confirm) => {
                                if (confirm) {
                                    await updatePrices(changedPrices.map(({newPrice}) => newPrice));
                                }
                                setPriceChangeDialogProps(prevState => ({...prevState, open: false}));
                                cleanup();
                                onSaved?.();
                            }
                        });
                    }


                } catch (error) {
                    console.error(error);
                    showSnackbar('error', 'Greška pri čuvanju otpremnice');
                    cleanup();
                    onSaved?.();
                }
            }, 500);
        }
    }, [customer, existingInvoice, invoiceDate, dateDue, invoiceRefNo, amount_before_discount, discount, amount, setGlobalState, lineItems, showSnackbar, detectChangedPrices, updateInvoice, insertInvoice, cleanup, onSaved, updatePrices]);

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
            <TextField label='Broj računa' value={invoiceRefNo} slotProps={{htmlInput: {readOnly: true}}}/>
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
            {/*<FormControlLabel control={<Checkbox/>} label="Stavi pečat i potpis" disabled/>*/}
        </div>
        <PriceChangeDialog {...priceChangeDialogProps}></PriceChangeDialog>
    </div>;
}
