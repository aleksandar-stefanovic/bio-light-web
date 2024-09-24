import React, {useCallback, useMemo, useState} from 'react';
import TabProps from './TabProps';
import {DataGrid, GridColDef, GridRowSelectionModel} from '@mui/x-data-grid';
import Invoice from '../data/Invoice.ts';
import dayjs from 'dayjs';
import SearchBar from '../component/SearchBar';
import {Button, Dialog, DialogContent} from '@mui/material';
import {useGlobalState} from '../GlobalStateProvider';
import LineItem from '../data/LineItem.ts';
import LineItemDao from '../data/supabase/LineItemDao.ts';
import {CustomerId} from '../data/Customer.ts';
import {sortBy} from 'lodash';
import TabCreateInvoice from './TabCreateInvoice.tsx';
import {useRepository} from '../repository/Repository.tsx';

interface TabInvoicesProps extends TabProps {
    onInvoiceUpdate: (invoice: Invoice) => Promise<void>
}

export default function TabInvoices({onInvoiceUpdate, visible, style, showSnackbar, theme}: TabInvoicesProps) {

    const {customers, products} = useRepository();

    const invoiceColumns: GridColDef[] = [
        {field: 'ref_no', headerName: 'RB', width: 70},
        {field: 'kupac_id', headerName: 'Kupac', flex: 1, valueGetter: (value) => customers.find(customer => customer.id === value)?.name ?? 'GREŠKA'},
        {field: 'date', headerName: 'Datum', width: 100, valueGetter: (value) => dayjs(value).format('DD.MM.YYYY.')},
        {field: 'date_due', headerName: 'Datum valute', width: 100, valueGetter: (value) => dayjs(value).format('DD.MM.YYYY.')},
        {field: 'amount_before_discount', headerName: 'Iznos', width: 100, valueGetter: value => Number(value).toFixed(2)},
        {field: 'discount', headerName: 'Popust', width: 100, valueGetter: value => Number(value).toFixed(2)},
        {field: 'amount', headerName: 'Za uplatu', width: 100, valueGetter: value => Number(value).toFixed(2)}
    ];

    const lineItemColumns: GridColDef[] = [
        {field: 'order_no', headerName: 'RB'},
        {field: 'product_id', headerName: 'Proizvod', flex: 1, valueGetter: (value) => products.find(product => product.id === value)?.name ?? 'GREŠKA'},
        {field: 'count', headerName: 'Količina'},
        {field: 'discount_perc', headerName: 'Rabat', valueGetter: (value) => value + '%'},
        {field: 'price', headerName: 'Cena'},
        {field: 'unit', headerName: 'JM'},
    ];


    const [, setGlobalState] = useGlobalState();
    const [searchTerm, setSearchTerm] = React.useState<string>('');
    const {invoices} = useRepository();
    const [invoiceEditorOpen, setInvoiceEditorOpen] = useState<boolean>(false);
    const filteredInvoices = useMemo(() => {
        if (searchTerm) {
            const customerScores = new Map<CustomerId, number>();
            customers.forEach(customer => {
                const tokens = customer.name.trim().toLowerCase().split(/\s+/);
                const lowerCaseSearchTerm = searchTerm.toLowerCase();
                const exactMatchScore = tokens.filter(token => token === lowerCaseSearchTerm).length * 10;
                const nearMatchScore = tokens.filter(token => token.includes(lowerCaseSearchTerm)).length;
                const total = exactMatchScore + nearMatchScore;
                if (total && customer.id) {
                    customerScores.set(customer.id, total);
                }
            });

            const viableInvoices = invoices.filter(invoice => customerScores.has(invoice.customer_id));
            return sortBy(viableInvoices, invoice => -(customerScores.get(invoice.customer_id)!));
        } else {
            return invoices;
        }
    }, [invoices, customers, searchTerm]);
    const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice|undefined>();
    const [selectedLineItems, setSelectedLineItems] = React.useState<LineItem[]>([]);

    React.useEffect(() => {
        if (selectedInvoice) {
            LineItemDao.getByInvoiceId(selectedInvoice.id).then(lineItems => {
                selectedInvoice.lineItems = lineItems;
                setSelectedLineItems(lineItems);
            });
        }
    }, [selectedInvoice]);

    const print = useCallback(() => {
        if (selectedInvoice) {
            const customer = customers.find(customer => customer.id === selectedInvoice.customer_id)!;
            setGlobalState({invoiceToPrint: {invoice: selectedInvoice, customer, products}});
            setTimeout(async () => {
                window.print();
            }, 500);
        }
    }, [customers, products, selectedInvoice, setGlobalState]);

    const edit = useCallback(() => {
        if (selectedInvoice) {
            setInvoiceEditorOpen(true);
        }
    }, [selectedInvoice]);

    function handleRowSelection(ids: GridRowSelectionModel) {
        setSelectedInvoice(invoices.find(invoice => invoice.id === ids[0]));
    }

    return <div style={{...style, display: visible ? 'flex' : 'none', flexDirection: 'row', padding: 10, gap: 10}}>
        <div style={{display: 'flex', flex: 1, flexDirection: 'column', gap: 10}}>
            <div style={{flex: 3, minHeight: 50, maxHeight: '100vh'}}>
                <DataGrid
                    columns={invoiceColumns}
                    rows={filteredInvoices}
                    getRowId={invoice => invoice.id}
                    autoPageSize
                    onRowSelectionModelChange={handleRowSelection}/>
            </div>
            <div style={{width: '100%', flex: 2, minHeight: 50}}>
                <DataGrid
                    style={{width: '100%', background: '#f2f2f2'}}
                    columns={lineItemColumns}
                    rows={selectedLineItems}
                    rowHeight={40}
                    getRowId={stProizvod => (stProizvod?.racun_id || 0) * 100 + (stProizvod?.na_spisku || 0) || 0}
                    hideFooter/>
            </div>

        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
            <SearchBar onSearchTerm={setSearchTerm} timeout={300}/>
            <Button variant='outlined' onClick={print}>Štampaj</Button>
            <Button variant='outlined' onClick={edit}>Izmeni račun</Button>
            {/*<Button variant='outlined' size='small' disabled={!selectedKupac} onClick={openKupacDialog}>Pogledaj kupca</Button>*/}
            {/*<Button variant='outlined' size='small' disabled={!selectedKupac} onClick={openCeneDialog}>Izmeni cene</Button>*/}
        </div>

        <Dialog open={invoiceEditorOpen} onClose={() => { setInvoiceEditorOpen(false); }} fullWidth maxWidth='xl'>
            <DialogContent>
                <TabCreateInvoice nextInvoiceNo={selectedInvoice?.ref_no ?? '0'}
                                  onInvoiceSave={onInvoiceUpdate}
                                  visible={invoiceEditorOpen}
                                  showSnackbar={showSnackbar}
                                  existingInvoice={selectedInvoice}
                                  theme={theme}/>
            </DialogContent>
        </Dialog>
    </div>;
}
