import {DataGrid, GridColDef} from '@mui/x-data-grid';
import {Button, Checkbox, FormControlLabel, IconButton, InputAdornment, TextField} from '@mui/material';
import {DatePicker} from '@mui/x-date-pickers';
import CloseIcon from '@mui/icons-material/Close';
import React, {useCallback, useState} from 'react';
import KupacPickerDialog from '../dialog/KupacPickerDialog';
import ProizvodInput from '../component/ProizvodInput';
import TabProps from './TabProps';
import StProizvod from '../data/StProizvod';
import Racun from '../data/Racun';
import lodash from 'lodash';
import Proizvod from '../data/Proizvod';
import Kupac from '../data/Kupac';
import {useGlobalState} from "../GlobalStateProvider";
import * as CenaDao from '../data/supabase/CenaDao';
import Cena from '../data/Cena';
import {Dayjs} from 'dayjs';
import dayjs from 'dayjs';

const _ = lodash;

interface TabIzradaProps extends TabProps {
    nextRacunRb: string;
    insertRacun: (racun: Racun) => Promise<void>;
    kupacs: Kupac[];
    proizvods: Proizvod[];
}

export default function TabIzrada({style, visible, showSnackbar, nextRacunRb, insertRacun, kupacs, proizvods}: TabIzradaProps) {
    const [, setGlobalState] = useGlobalState();

    const [stProizvods, setStProizvods] = React.useState<StProizvod[]>([]);
    const iznos = _.sum(stProizvods.map(p => p.cena * p.kolicina));
    const popust = _.sum(stProizvods.map(p => p.cena * p.kolicina * p.rabat));
    const zaUplatu = _.sum(stProizvods.map(p => p.cena * p.kolicina * (1 - p.rabat)));

    const onProizvodAdd = useCallback(async (stProizvod: StProizvod) => {
        stProizvod.na_spisku = !_.isEmpty(stProizvods) ? Math.max(...stProizvods.map(p => p.na_spisku)) + 1 : 1;
        setStProizvods(oldRows => [...oldRows, stProizvod]);
    }, [stProizvods, setStProizvods]);

    const removeRow = useCallback((na_spisku: number) => {
        setStProizvods(oldRows => {
            return oldRows
            .filter(stProizvod => stProizvod.na_spisku !== na_spisku)
            .map((stProizvod, index) => {
                stProizvod.na_spisku = index + 1;
                return stProizvod;
            });
        });
    }, [setStProizvods]);

    const columns: GridColDef[] = [
        {field: 'na_spisku', headerName: 'RB', width: 50},
        {
            field: 'naziv',
            headerName: 'Naziv',
            flex: 1,
            valueGetter: (_, row) => proizvods.find(({id}) => id === row.proizvod_id)?.ime
        },
        {field: 'kolicina', headerName: 'Količina', width: 100},
        {field: 'jm', headerName: 'JM', width: 50, valueGetter: (_, row) => row.rinfuz ? 'kg' : 'kom'},
        {field: 'cena', headerName: 'Cena', width: 100, valueGetter: (value) => Number(value).toFixed(2)},
        {field: 'rabat', headerName: 'Rabat', width: 100, valueGetter: (value) => (value * 100) + '%'},
        {
            field: 'osnovica',
            headerName: 'Osnovica',
            width: 100,
            valueGetter: (_, row) => (row.cena * row.kolicina * (1 - row.rabat)).toFixed(2),
        },
        {
            field: 'vrednost',
            headerName: 'Vrednost',
            width: 100,
            valueGetter: (_, row) => (row.cena * row.kolicina).toFixed(2),
        },
        {
            field: 'Izbriši', width: 100,
            renderCell: (params) => {
                return (
                    <IconButton onClick={() => removeRow(params.row.na_spisku)}>
                        <CloseIcon/>
                    </IconButton>
                );
            }
        }
    ];

    const [datumRacuna, setDatumRacuna] = React.useState<Dayjs>(dayjs());
    const [valuta, setValuta] = React.useState('30');
    const datumValute = React.useMemo(() => {
        const valutaNum = !isNaN(Number(valuta)) ? Number(valuta) : 30
        return datumRacuna.add(valutaNum, 'day');
    }, [datumRacuna, valuta]);
    const datumValuteDisplay = datumValute.format('DD.MM.YYYY.');

    const [kupac, setKupac] = React.useState<Kupac>();
    const [kupacPickerDialogOpen, setKupacDialogPickerOpen] = React.useState(false);
    const [kupacCenas, setKupacCenas] = useState<Cena[]>([]);

    React.useEffect(() => {
        if (kupac) {
            CenaDao.getForKupac(kupac).then(cenas => {
                setKupacCenas(cenas);
            })
        }
    }, [kupac, setKupacCenas]);

    const onSelectKupac = useCallback((kupac: Kupac) => {
        setKupac(kupac);
        setKupacDialogPickerOpen(false);
    }, [setKupac, setKupacDialogPickerOpen]);

    const cleanup = useCallback(() => {
        setKupac(undefined);
        setStProizvods([]);
        setGlobalState({racunToPrint: undefined});
    }, [setKupac, setStProizvods, setGlobalState]);

    const printDocument = useCallback(async () => {
        if (kupac) {
            if (!kupac.id) {
                showSnackbar('error', `Kupac ${kupac.ime} nema ID.`);
                return;
            }
            const racun: Racun = {
                id: 0,
                datum: datumRacuna.toDate(),
                datum_valute: datumValute.toDate(),
                rb: nextRacunRb,
                kupac_id: kupac.id,
                stproizvodi: stProizvods,
                iznos: iznos,
                popust: popust,
                za_uplatu: zaUplatu,
                saldo: kupac.stanje + zaUplatu
            };
            setGlobalState({racunToPrint: {racun, kupac, proizvods: proizvods}});
            setTimeout(async () => {
                try {
                    await insertRacun(racun);
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
    }, [cleanup, datumRacuna, datumValute, insertRacun, iznos, kupac, nextRacunRb, popust, proizvods, setGlobalState, showSnackbar, stProizvods, zaUplatu]);

    return <div style={{...style, display: visible ? 'flex' : 'none', flexDirection: 'row', height: '100%'}}>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', height: '100%'}}>
            <ProizvodInput
                onAdd={onProizvodAdd}
                onError={(message) => showSnackbar('error', message)}
                defaultRabat={kupac?.rabat}
                disabled={!kupac}
                proizvods={proizvods}
                cenas={kupacCenas}/>
            <div style={{flexGrow: 1, minHeight: 50}}>
                <DataGrid rows={stProizvods} columns={columns} hideFooter
                          getRowId={(stProizvod) => stProizvod?.na_spisku || 0}/>
            </div>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 10, padding: 10}}>
            {visible}
            <Button variant='outlined' onClick={() => setKupacDialogPickerOpen(true)}>Izaberi kupca</Button>
            <KupacPickerDialog open={kupacPickerDialogOpen}
                               onSelectKupac={onSelectKupac}
                               onClose={() => setKupacDialogPickerOpen(false)}
                               kupacs={kupacs}/>
            <TextField label='Kupac' value={kupac?.ime || ''}/>
            <TextField label='Broj računa' value={nextRacunRb}/>
            <DatePicker
                label="Datum računa"
                value={datumRacuna}
                format={'DD.MM.YYYY.'}
                onChange={(newValue) => {
                    if (newValue) {
                        setDatumRacuna(newValue)
                    }
                }}
            />
            <TextField
                label='Valuta'
                value={valuta}
                onChange={(event) => setValuta(event.target.value)}
                slotProps={{input: {endAdornment: <InputAdornment position="end">dana</InputAdornment>}}}
            />
            <TextField
                label='Datum valute'
                value={datumValuteDisplay}
            />
            <TextField
                label='Iznos'
                value={iznos.toFixed(2)}
            />
            <TextField
                label='Popust'
                value={popust.toFixed(2)}
            />
            <TextField
                label='Za uplatu'
                value={zaUplatu.toFixed(2)}
            />
            <Button variant='contained' size='large' onClick={printDocument}>Zatvori račun</Button>
            <FormControlLabel control={<Checkbox/>} label="Stavi pečat i potpis" disabled/>
        </div>
    </div>;
}
