import React, {useEffect, useState} from 'react';
import {DataGrid, GridColDef, GridRowId} from '@mui/x-data-grid';
import Kupac from '../data/Kupac';
import SearchBar from '../component/SearchBar';
import {Button} from '@mui/material';
import TabProps from './TabProps';
import KupacDialog from '../dialog/KupacDialog';
import Promena from '../data/supabase/Promena';
import * as KupacDao from '../data/supabase/KupacDao';
import Racun from '../data/Racun';
import {format, parseISO} from 'date-fns';

interface TabKupciProps extends TabProps {
    kupacs: Kupac[];
}

export default function TabKupci({visible, style, kupacs, theme}: TabKupciProps) {

    const [selectedKupac, setSelectedKupac] = React.useState<Kupac>();
    const [searchTerm, setSearchTerm] = React.useState<string>('')
    const [kupacDialogOpen, setKupacDialogOpen] = React.useState(false);
    const [promenas, setPromenas] = useState<Promena[]>([]);

    useEffect(() => {
        if (selectedKupac) {
            KupacDao.getAllPromenas(selectedKupac).then(promenas => setPromenas(promenas));
        }
    }, [selectedKupac]);

    const searchTerms = searchTerm.trim().toLowerCase().split(/\s+/)

    const kupacsFiltered = React.useMemo(() => {
        return kupacs.map(kupac => {
            return {
                kupac,
                count: searchTerms.filter(searchTerm => kupac.ime.toLowerCase().includes(searchTerm)).length
            }
        })
            .filter(it => it.count > 0)
            .sort((a, b) => b.count - a.count)
            .map(({kupac}) => kupac)
    }, [kupacs, searchTerms]);

    const kupciColumns: GridColDef[] = [
        {field: 'ime', headerName: 'Naziv', flex: 1},
        {field: 'adresa', headerName: 'Adresa', flex: 1},
        {field: 'stanje', headerName: 'Stanje', align: 'right'}
    ];

    const racuniColumns: GridColDef[] = [
        {field: 'rb', headerName: 'RB'},
        {field: 'tip', headerName: 'Tip', valueGetter: ({row}) => row.datum_valute ? 'Račun' : 'Uplata'},
        {field: 'datum', headerName: 'Datum', valueGetter: ({row}) => format(parseISO(row.datum), 'dd.MM.yyyy.')},
        {field: 'datum_valute', headerName: 'Datum valute', flex: 1, valueGetter: ({row}) => row.datum_valute && format(parseISO(row.datum_valute), 'dd.MM.yyyy.')},
        {field: 'iznos', headerName: 'Pre popusta', align: 'right', flex: 1, valueGetter: ({row}) => row.iznos.toFixed(2), headerAlign: 'right'},
        {field: 'popust', headerName: 'Popust', align: 'right', flex: 1, valueGetter: ({row}) => row.popust?.toFixed(2), headerAlign: 'right'},
        {
            field: 'za_uplatu',
            headerName: 'Iznos',
            align: 'right',
            flex: 1,
            valueGetter: ({row}) => {
                if (row.za_uplatu) {
                    return row.za_uplatu.toFixed(2);
                } else {
                    return row.iznos.toFixed(2);
                }
            },
            headerAlign: 'right'
        },
        {field: 'saldo', headerName: 'Saldo', flex: 1, align: 'right'},
        // {field: 'na_osnovu', headerName: 'Na osnovu'}
    ]

    async function insertKupac() {

    }

    async function openKupacDialog() {
        setKupacDialogOpen(true);
    }

    function onKupacDialogClose(save: boolean) {
        setKupacDialogOpen(false);
    }

    function openCeneDialog() {

    }

    async function onKupacRowSelected([kupacId]: GridRowId[]) {
        setSelectedKupac(kupacs.find(kupac => kupac.id === kupacId));
    }

    return <div style={{...style, display: visible ? 'flex' : 'none', flexDirection: 'row', gap: 10, padding: 10}}>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'start'}}>
            <div style={{flex: 6, width: '100%', minHeight: 50}}>
                <DataGrid style={{width: '100%'}}
                          columns={kupciColumns}
                          rows={kupacsFiltered}
                          onSelectionModelChange={onKupacRowSelected}
                          rowHeight={40}
                          headerHeight={30}
                          selectionModel=''
                          hideFooterSelectedRowCount/>
            </div>
            <div style={{width: '100%', flex: 4, minHeight: 50}}>
                <DataGrid style={{width: '100%', flex: 4, background: theme.palette.mode === 'light' ? '#f2f2f2' : undefined}}
                          columns={racuniColumns}
                          rows={promenas}
                          getRowId={(row: Promena) => row.id + ((row as Racun).popust ?? -1)?.toString() }
                          rowHeight={40}
                          hideFooter/>
            </div>

        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
            <SearchBar onSearchTerm={setSearchTerm} timeout={300}/>
            <Button variant='outlined' size='small' onClick={insertKupac}>Dodaj kupca</Button>
            <Button variant='outlined' size='small' disabled={!selectedKupac} onClick={openKupacDialog}>Pogledaj kupca</Button>
            <Button variant='outlined' size='small' disabled={!selectedKupac} onClick={openCeneDialog}>Izmeni cene</Button>
            <Button variant='outlined' size='small' disabled={true}>Napravi izveštaj za kupca</Button>
        </div>
        {selectedKupac && <KupacDialog open={kupacDialogOpen} kupac={selectedKupac} onClose={onKupacDialogClose} />}
    </div>
}
