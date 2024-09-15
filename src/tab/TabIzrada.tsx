import {DataGrid, GridColDef} from '@mui/x-data-grid';
import {Button, Checkbox, FormControlLabel, IconButton, InputAdornment, TextField} from '@mui/material';
import {DatePicker} from '@mui/x-date-pickers';
import CloseIcon from '@mui/icons-material/Close';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import KupacPickerDialog from '../dialog/KupacPickerDialog';
import ProizvodInput from '../component/ProizvodInput';
import TabProps from './TabProps';
import StProizvod from '../data/StProizvod';
import Invoice from '../data/Invoice.ts';
import lodash from 'lodash';
import Proizvod from '../data/Proizvod';
import Kupac from '../data/Kupac';
import {useGlobalState} from "../GlobalStateProvider";
import * as CenaDao from '../data/supabase/CenaDao';
import Cena from '../data/Cena';
import {Dayjs} from 'dayjs';
import dayjs from 'dayjs';
import StProizvodDao from '../data/supabase/StProizvodDao.ts';

const _ = lodash;

interface TabIzradaProps extends TabProps {
    nextInvoiceNo: string;
    onInvoiceSave: (invoice: Invoice) => Promise<void>;
    kupacs: Kupac[];
    proizvods: Proizvod[];
    existingInvoice?: Invoice;
}

export default function TabIzrada({style, visible, showSnackbar, nextInvoiceNo, onInvoiceSave, kupacs, proizvods, existingInvoice}: TabIzradaProps) {
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

    const columns: GridColDef[] = useMemo(() => [
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
    ], [proizvods, removeRow]);

    const [invoiceDate, setInvoiceDate] = React.useState<Dayjs>(dayjs(existingInvoice?.datum));
    const [valuta, setValuta] = React.useState<string>(() => {
        if (existingInvoice) {
            const dayDifference = dayjs(existingInvoice.datum_valute).diff(dayjs(existingInvoice.datum), 'day');
            return dayDifference.toString();
        } else {
            return '30';
        }
    });
    const datumValute = React.useMemo(() => {
        const valutaNum = !isNaN(Number(valuta)) ? Number(valuta) : 30
        return invoiceDate.add(valutaNum, 'day');
    }, [invoiceDate, valuta]);
    const datumValuteDisplay = datumValute.format('DD.MM.YYYY.');

    const [kupac, setKupac] = React.useState<Kupac>();
    const [kupacPickerDialogOpen, setKupacDialogPickerOpen] = React.useState(false);
    const [kupacCenas, setKupacCenas] = useState<Cena[]>([]);

    useEffect(() => {
        if (visible && existingInvoice) {
            setKupac(kupacs.find(kupac => kupac.id === existingInvoice.kupac_id));
            StProizvodDao.getByInvoiceId(existingInvoice.id).then(stProizvods => {
                setStProizvods(stProizvods);
            })

        }
    }, [existingInvoice, kupacs, visible]);

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
        setGlobalState({invoiceToPrint: undefined});
    }, [setKupac, setStProizvods, setGlobalState]);

    const saveInvoice = useCallback(async () => {
        if (kupac) {
            if (!kupac.id) {
                showSnackbar('error', `Kupac ${kupac.ime} nema ID.`);
                return;
            }
            const invoice: Invoice = {
                id: existingInvoice?.id ?? 0,
                datum: invoiceDate.toDate(),
                datum_valute: datumValute.toDate(),
                rb: existingInvoice?.rb ?? nextInvoiceNo,
                kupac_id: kupac.id,
                stproizvodi: stProizvods,
                iznos: iznos,
                popust: popust,
                za_uplatu: zaUplatu,
                saldo: kupac.stanje + zaUplatu // This only works for new invoices, the logic works differently for edited ones
            };
            setGlobalState({invoiceToPrint: {invoice: invoice, kupac, proizvods: proizvods}});
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
    }, [cleanup, invoiceDate, datumValute, onInvoiceSave, iznos, kupac, nextInvoiceNo, popust, proizvods, setGlobalState, showSnackbar, stProizvods, zaUplatu]);

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
            <Button variant='contained' size='large' onClick={saveInvoice}>{existingInvoice ? 'Sačuvaj račun' : 'Zatvori račun'}</Button>
            <FormControlLabel control={<Checkbox/>} label="Stavi pečat i potpis" disabled/>
        </div>
    </div>;
}
