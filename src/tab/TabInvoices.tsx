import React, {useCallback, useMemo, useState} from 'react';
import TabProps from './TabProps';
import {DataGrid, GridColDef, GridRowSelectionModel} from '@mui/x-data-grid';
import Invoice from '../data/Invoice.ts';
import dayjs from 'dayjs';
import SearchBar from '../component/SearchBar';
import {Button, Dialog, DialogContent} from '@mui/material';
import Proizvod from '../data/Proizvod';
import {useGlobalState} from '../GlobalStateProvider';
import StProizvod from '../data/StProizvod';
import StProizvodDao from '../data/supabase/StProizvodDao';
import Kupac, {KupacId} from '../data/Kupac';
import {sortBy} from 'lodash';
import TabIzrada from './TabIzrada.tsx';
import {useRepository} from '../repository/Repository.tsx';

interface TabInvoicesProps extends TabProps {
    proizvods: Proizvod[];
    kupacs: Kupac[];
    onInvoiceUpdate: (invoice: Invoice) => Promise<void>
}

export default function TabInvoices({onInvoiceUpdate, kupacs, visible, style, proizvods, showSnackbar, theme}: TabInvoicesProps) {

    const columns: GridColDef[] = [
        {field: 'rb', headerName: 'RB', width: 70},
        {field: 'kupac_id', headerName: 'Kupac', flex: 1, valueGetter: (value) => kupacs.find(kupac => kupac.id === value)?.ime ?? 'GREŠKA'},
        {field: 'datum', headerName: 'Datum', width: 100, valueGetter: (value) => dayjs(value).format('DD.MM.YYYY.')},
        {field: 'datum_valute', headerName: 'Datum valute', width: 100, valueGetter: (value) => dayjs(value).format('DD.MM.YYYY.')},
        {field: 'iznos', headerName: 'Iznos', width: 100},
        {field: 'popust', headerName: 'Popust', width: 100},
        {field: 'za_uplatu', headerName: 'Za uplatu', width: 100}
    ];

    const stProizvodiColumns: GridColDef[] = [
        {field: 'na_spisku', headerName: 'RB'},
        {field: 'proizvod_id', headerName: 'Proizvod', flex: 1, valueGetter: (value) => proizvods.find(proizvod => proizvod.id === value)?.ime ?? 'GREŠKA'},
        {field: 'kolicina', headerName: 'Količina'},
        {field: 'rabat', headerName: 'Rabat', valueGetter: (value) => value + '%'},
        {field: 'cena', headerName: 'Cena'},
        {field: 'jm', headerName: 'JM', valueGetter: (value) => value ? 'kg' : 'kom'},
    ];


    const [, setGlobalState] = useGlobalState();
    const [searchTerm, setSearchTerm] = React.useState<string>('');
    const {invoices} = useRepository();
    const [invoiceEditorOpen, setInvoiceEditorOpen] = useState<boolean>(false);
    const filteredInvoices = useMemo(() => {
        if (searchTerm) {
            const kupacScores = new Map<KupacId, number>();
            kupacs.forEach(kupac => {
                const tokens = kupac.ime.trim().toLowerCase().split(/\s+/);
                const lowerCaseSearchTerm = searchTerm.toLowerCase();
                const exactMatchScore = tokens.filter(token => token === lowerCaseSearchTerm).length * 10;
                const nearMatchScore = tokens.filter(token => token.includes(lowerCaseSearchTerm)).length;
                const total = exactMatchScore + nearMatchScore;
                if (total && kupac.id) {
                    kupacScores.set(kupac.id, total);
                }
            });

            const viableInvoices = invoices.filter(invoice => kupacScores.has(invoice.kupac_id));
            return sortBy(viableInvoices, invoice => -(kupacScores.get(invoice.kupac_id)!));
        } else {
            return invoices;
        }
    }, [invoices, kupacs, searchTerm]);
    const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice|undefined>();
    const [selectedStProizvods, setSelectedStProizvods] = React.useState<StProizvod[]>([]);

    React.useEffect(() => {
        (async function () {
            if (selectedInvoice) {
                const stProizvods = await StProizvodDao.getByInvoiceId(selectedInvoice.id);
                selectedInvoice.stproizvodi = stProizvods;
                setSelectedStProizvods(stProizvods);
            }
        })();

    }, [selectedInvoice])

    const print = useCallback(() => {
        if (selectedInvoice) {
            const kupac = kupacs.find(kupac => kupac.id === selectedInvoice.kupac_id)!;
            setGlobalState({invoiceToPrint: {invoice: selectedInvoice, kupac, proizvods}});
            setTimeout(async () => {
                window.print();
            }, 500);
        }
    }, [kupacs, proizvods, selectedInvoice, setGlobalState]);

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
                    columns={columns}
                    rows={filteredInvoices}
                    getRowId={invoice => invoice.id}
                    autoPageSize
                    onRowSelectionModelChange={handleRowSelection}/>
            </div>
            <div style={{width: '100%', flex: 2, minHeight: 50}}>
                <DataGrid
                    style={{width: '100%', background: '#f2f2f2'}}
                    columns={stProizvodiColumns}
                    rows={selectedStProizvods}
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
                <TabIzrada nextInvoiceNo={selectedInvoice?.rb ?? '0'}
                           onInvoiceSave={onInvoiceUpdate}
                           kupacs={kupacs}
                           proizvods={proizvods}
                           visible={invoiceEditorOpen}
                           showSnackbar={showSnackbar}
                           existingInvoice={selectedInvoice}
                           theme={theme}/>
            </DialogContent>
        </Dialog>
    </div>;
}
