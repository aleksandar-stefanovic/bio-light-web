import React, {useMemo, useState} from 'react';
import TabProps from './TabProps';
import {DataGrid, GridColDef, GridSelectionModel} from '@mui/x-data-grid';
import Racun from '../data/Racun';
import {format, parseISO} from 'date-fns';
import SearchBar from '../component/SearchBar';
import {Button} from '@mui/material';
import Proizvod from '../data/Proizvod';
import {useGlobalState} from '../GlobalStateProvider';
import StProizvod from '../data/StProizvod';
import StProizvodDao from '../data/supabase/StProizvodDao';
import RacunDao from '../data/supabase/RacunDao';
import Kupac from '../data/Kupac';
import {sortBy, uniqBy} from 'lodash';

interface TabRacuniProps extends TabProps {
    proizvods: Proizvod[];
    kupacs: Kupac[];
}

export default function TabRacuni({kupacs, visible, style, proizvods}: TabRacuniProps) {

    const columns: GridColDef[] = [
        {field: 'rb', headerName: 'RB', width: 70},
        {field: 'kupac', headerName: 'Kupac', flex: 1, valueGetter: ({row}) => row.kupac.ime},
        {field: 'datum', headerName: 'Datum', width: 100, valueGetter: ({row}) => format(parseISO(row.datum), 'dd.MM.yyyy.')},
        {field: 'datum_valute', headerName: 'Datum valute', width: 100, valueGetter: ({row}) => format(parseISO(row.datum_valute), 'dd.MM.yyyy.')},
        {field: 'iznos', headerName: 'Iznos', width: 100},
        {field: 'popust', headerName: 'Popust', width: 100},
        {field: 'za_uplatu', headerName: 'Za uplatu', width: 100}
    ];

    const stProizvodiColumns: GridColDef[] = [
        {field: 'na_spisku', headerName: 'RB'},
        {field: 'proizvod_id', headerName: 'Proizvod', flex: 1, valueGetter: ({row}) => proizvods.find(proizvod => proizvod.id === row.proizvod_id)!.ime},
        {field: 'kolicina', headerName: 'Količina'},
        {field: 'rabat', headerName: 'Rabat', valueGetter: ({row}) => row.rabat + '%'},
        {field: 'cena', headerName: 'Cena'},
        {field: 'jm', headerName: 'JM', valueGetter: ({row}) => row.rinfuz ? 'kg' : 'kom'},
    ];


    const [, setGlobalState] = useGlobalState();
    const [searchTerm, setSearchTerm] = React.useState<string>('');
    const [racuns, setRacuns] = useState<Racun[]>([]);
    const filteredRacuns = useMemo(() => {
        if (searchTerm) {
            const kupacScores = new Map<Kupac, number>();
            uniqBy(racuns.map(racun => racun.kupac), (kupac: Kupac) => kupac.ime).forEach(kupac => {
                const tokens = kupac.ime.trim().toLowerCase().split(/\s+/);
                const lowerCaseSearchTerm = searchTerm.toLowerCase();
                const exactMatchScore = tokens.filter(token => token === lowerCaseSearchTerm).length * 10;
                const nearMatchScore = tokens.filter(token => token.includes(lowerCaseSearchTerm)).length;
                const total = exactMatchScore + nearMatchScore;
                if (total) {
                    kupacScores.set(kupac, total);
                }
            });

            const viableRacuns = racuns.filter(racun => kupacScores.has(racun.kupac));
            return sortBy(viableRacuns, racun => -(kupacScores.get(racun.kupac)!));
        } else {
            return racuns;
        }
    }, [racuns, searchTerm]);
    const [selectedRacun, setSelectedRacun] = React.useState<Racun>();
    let [selectedStProizvods, setSelectedStProizvods] = React.useState<StProizvod[]>([]);

    React.useEffect(() => {
        if (visible && racuns.length === 0) {
            RacunDao.getAll().then(racuns => {
                racuns.forEach(racun => {
                    const kupacId = (racun as Racun & {kupac_id: number}).kupac_id;
                    racun.kupac = kupacs.find(kupac => kupac.id === kupacId)!;
                });
                setRacuns(racuns);
            });
        }
    }, [visible, racuns, kupacs]);

    React.useEffect(() => {
        (async function () {
            if (selectedRacun) {
                const stProizvods = await StProizvodDao.getByRacunId(selectedRacun.id);
                setSelectedStProizvods(stProizvods);
            }
        })();

    }, [selectedRacun])

    function print() {
        if (selectedRacun) {
            debugger;
            setGlobalState({racunToPrint: {racun: selectedRacun, kupac: selectedRacun.kupac, proizvods}});
            setTimeout(async () => {
                window.print();
            }, 500);
        }
    }

    function handleRowSelection(ids: GridSelectionModel) {
        setSelectedRacun(racuns.find(racun => racun.id === ids[0]));
    }

    return <div style={{...style, display: visible ? 'flex' : 'none', flexDirection: 'row', padding: 10, gap: 10}}>
        <div style={{display: 'flex', flex: 1, flexDirection: 'column', gap: 10}}>
            <div style={{flex: 3, minHeight: 50}}>
                <DataGrid
                    columns={columns}
                    rows={filteredRacuns}
                    getRowId={racun => racun.id}
                    autoPageSize
                    onSelectionModelChange={handleRowSelection}/>
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
            {/*<Button variant='outlined' size='small' disabled={!selectedKupac} onClick={openKupacDialog}>Pogledaj kupca</Button>*/}
            {/*<Button variant='outlined' size='small' disabled={!selectedKupac} onClick={openCeneDialog}>Izmeni cene</Button>*/}
        </div>
    </div>;
}
