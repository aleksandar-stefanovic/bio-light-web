import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {DataGrid, GridColDef, GridRowSelectionModel} from '@mui/x-data-grid';
import Customer from '../data/Customer.ts';
import SearchBar from '../component/SearchBar';
import {Button} from '@mui/material';
import CustomerDialog from '../dialog/CustomerDialog.tsx';
import Transaction from '../data/Transaction.ts';
import * as CustomerDao from '../data/supabase/CustomerDao.ts';
import dayjs from 'dayjs';
import {useRepository} from '../repository/Repository.tsx';
import TabProps from './TabProps.ts';
import _ from 'lodash';
import Price from '../data/Price.ts';

export default function TabCustomers({visible, style, theme, showSnackbar}: TabProps) {

    const [selectedCustomer, setSelectedCustomer] = useState<Customer>();
    const [customerToEdit, setCustomerToEdit] = useState<Customer>();
    const [searchTerm, setSearchTerm] = useState<string>('')
    const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const {recalculateBalance, customers, insertCustomer, updateCustomer} = useRepository();

    useEffect(() => {
        if (selectedCustomer) {
            // TODO this functionality should go through the Repository
            CustomerDao.getAllTransactions(selectedCustomer.id).then(transactions => {
                setTransactions(_.reverse(transactions));
            });
        }
    }, [selectedCustomer]);

    const customersFiltered = React.useMemo(() => {
        const searchTerms = searchTerm.trim().toLowerCase().split(/\s+/)

        return customers.map(customer => {
            return {
                customer,
                count: searchTerms.filter(searchTerm => customer.name.toLowerCase().includes(searchTerm)).length
            }
        })
        .filter(it => it.count > 0)
        .sort((a, b) => b.count - a.count)
        .map(({customer}) => customer);
    }, [customers, searchTerm]);

    const customerColumns: GridColDef[] = useMemo(() => [
        {field: 'id', headerName: 'RB', width: 30},
        {field: 'name', headerName: 'Naziv', flex: 1},
        {field: 'address', headerName: 'Adresa', flex: 1},
        {field: 'balance', headerName: 'Stanje', align: 'right'}
    ], []);

    const transactionColumns: GridColDef[] = [
        {field: 'ref_no', headerName: 'RB', valueGetter: (_, row) => row.ref_no ?? row.id}, // Ref no. for payments is actually its ID
        {field: 'type', headerName: 'Tip', valueGetter: (_, row) => 'date_due' in row ? 'Račun' : 'Uplata'},
        {field: 'date', headerName: 'Datum', valueGetter: (value) => dayjs(value).format('DD.MM.YYYY.')},
        {field: 'date_due', headerName: 'Datum valute', flex: 1, valueGetter: (value) => value && dayjs(value).format('DD.MM.YYYY.')},
        {field: 'amount_before_discount', headerName: 'Pre popusta', align: 'right', flex: 1, valueGetter: (value) => value ? Number(value).toFixed(2) : '', headerAlign: 'right'},
        {field: 'discount', headerName: 'Popust', align: 'right', flex: 1, valueGetter: (value) => value && Number(value).toFixed(2), headerAlign: 'right'},
        {field: 'amount', headerName: 'Iznos', align: 'right', flex: 1, valueGetter: (value) => (value as number).toFixed(2), headerAlign: 'right'},
        {field: 'balance', headerName: 'Saldo', flex: 1, align: 'right', valueGetter: (value) => (value as number).toFixed(2)},
    ]

    const openCustomerDialog = useCallback((intent: 'create'|'edit') => {
        if (intent === 'edit') {
            setCustomerToEdit(selectedCustomer);
        } else {
            setCustomerToEdit(undefined);
        }

        setCustomerDialogOpen(true);
    }, [selectedCustomer]);

    const onCustomerDialogClose = useCallback(async(customer?: Customer, prices?: Price[]) => {
        setCustomerDialogOpen(false);
        if (customer && prices) {
            try {
                if (customer.id === 0) {
                    await insertCustomer(customer, prices);
                } else {
                    await updateCustomer(customer, prices);
                }
                showSnackbar('success', 'Uspešno sačuvan kupac.');
            } catch (error) {
                showSnackbar('error', `Greška: ${error}`);
            }
        }
    }, [insertCustomer, showSnackbar, updateCustomer]);

    const onCustomerRowSelected = useCallback(async([customerId]: GridRowSelectionModel) => {
        setSelectedCustomer(customers.find(customers => customers.id === customerId));
    }, [customers]);

    return <div style={{...style, display: visible ? 'flex' : 'none', flexDirection: 'row', gap: 10, padding: 10, height: 1}}> {/* Setting the height to any value fixes the layout issues somehow? */}
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'start', height: '100%', gap: 10}}>
            <div style={{flex: 6, width: '100%', minHeight: 50}}>
                <DataGrid style={{width: '100%'}}
                          columns={customerColumns}
                          rows={customersFiltered}
                          onRowSelectionModelChange={onCustomerRowSelected}
                          rowHeight={40}
                          columnHeaderHeight={30}
                          hideFooterSelectedRowCount/>
            </div>
            <div style={{width: '100%', flex: 4, minHeight: 50}}>
                <DataGrid style={{width: '100%', flex: 4, background: theme.palette.mode === 'light' ? '#f2f2f2' : undefined}}
                          columns={transactionColumns}
                          rows={transactions}
                          getRowId={(row: Transaction) => {
                              // Invoices and payments may have the same ID value, so this is something to distinguish them
                              return 'date_due' in row ? row.id : -row.id;
                          }}
                          rowHeight={40}/>
            </div>

        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
            <SearchBar onSearchTerm={setSearchTerm} timeout={300}/>
            <Button variant='outlined' size='small' onClick={() => { openCustomerDialog('create'); }}>Dodaj kupca</Button>
            <Button variant='outlined' size='small' disabled={!selectedCustomer} onClick={() => { openCustomerDialog('edit'); }}>Izmeni kupca</Button>
            <Button variant='outlined' size='small' disabled={true}>Napravi izveštaj za kupca</Button>
            <Button variant='outlined' size='small' onClick={() => recalculateBalance(selectedCustomer!.id)}>Preračunaj</Button>
        </div>
        {selectedCustomer && <CustomerDialog open={customerDialogOpen}
                                       existingCustomer={customerToEdit}
                                       onClose={onCustomerDialogClose} />}
    </div>
}
