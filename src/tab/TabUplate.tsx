import TabProps from './TabProps.ts';
import {useCallback, useEffect, useMemo, useState} from 'react';
import Uplata from '../data/Uplata.ts';
import * as UplataDao from '../data/supabase/UplataDao.ts';
import {Button} from '@mui/material';
import Kupac from '../data/Kupac.ts';
import {DataGrid, GridColDef, GridRowSelectionModel} from '@mui/x-data-grid';
import dayjs from 'dayjs';
import UplataDialog, {UplataDialogProps} from '../dialog/UplataDialog.tsx';

interface TabUplateProps extends TabProps {
    kupacs: Kupac[];
}

export default function TabUplate({visible, kupacs, style}: TabUplateProps) {

    const [uplatas, setUplatas] = useState<Uplata[]>([]);

    useEffect(() => {
        if (visible) {
            UplataDao.getRangeLast(0, 500).then(uplatas => {
                setUplatas(uplatas);
            }).catch(error => {
                window.alert(`Greška prilikom učitavanja uplata (${error})`)
            })
        }
    }, [visible]);

    const closeUplataDialog = useCallback(() => {
        // TODO handle save
        setUplataDialogProps(prevState => ({
            ...prevState,
            open: false
        }))
    }, []);

    const [uplataDialogProps, setUplataDialogProps] = useState<UplataDialogProps>({
        open: false,
        kupacs: kupacs,
        intent: 'create',
        onClose: closeUplataDialog
    });


    const onRowSelected = useCallback((rowSelectionModel: GridRowSelectionModel) => {
        const uplataId = rowSelectionModel[0];
        const uplata: Uplata = uplatas.find(uplata => uplata.id === uplataId)!;
        setUplataDialogProps(prevState => ({...prevState, uplata: uplata}));
        console.log("Kupac length", kupacs.length);
    }, [uplatas]);

    const onCreateUplata = useCallback(() => {
        setUplataDialogProps(prevState => ({
            ...prevState,
            open: true,
            uplata: undefined,
            intent: 'create',
            lastUplataDate: uplatas[0].datum
        }));
    }, [uplatas]);

    const onUpdateUplata = useCallback(() => {
        setUplataDialogProps(prevState => ({
            ...prevState,
            open: true,
            intent: 'edit'
        }));
    }, []);

    const columns: GridColDef[] = useMemo(() => [
        {field: 'id', headerName: 'RB'},
        {
            field: 'kupac_id',
            headerName: 'Kupac',
            valueGetter: value => kupacs.find(kupac => kupac.id === value)?.ime ?? 'GREŠKA',
            width: 500
        },
        {
            field: 'datum',
            headerName: 'Datum',
            valueGetter: value => dayjs(value).format('DD.MM.YYYY.'),
            align: 'right'
        },
        {field: 'iznos', headerName: 'Iznos', valueGetter: value => Number(value).toFixed(2), align: 'right', headerAlign: 'right'}
    ], [kupacs]);

    return <div style={{...style, display: visible ? 'flex' : 'none', flexDirection: 'row', height: 1}}>
        <div style={{height: '100%', flex: 1}}>
            <DataGrid columns={columns} rows={uplatas} onRowSelectionModelChange={onRowSelected} />
        </div>
        <div>
            <Button onClick={onCreateUplata}>Dodaj uplatu</Button>
            <Button onClick={onUpdateUplata}>Izmeni uplatu</Button>
        </div>

        <UplataDialog {...uplataDialogProps} kupacs={kupacs} />
    </div>
}