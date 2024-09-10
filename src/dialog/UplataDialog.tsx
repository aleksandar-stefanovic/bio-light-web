import Uplata from '../data/Uplata.ts';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, TextField} from '@mui/material';
import Kupac from '../data/Kupac.ts';
import {useCallback, useEffect, useState} from 'react';
import KupacPickerDialog from './KupacPickerDialog.tsx';

export interface UplataDialogProps {
    open: boolean;
    kupacs: Kupac[];
    uplata?: Uplata;
    intent: 'create'|'edit';
    lastUplataDate?: Date;
    onClose: (save: boolean, intent: 'create'|'edit', uplata?: Uplata) => void;
}

export default function UplataDialog({open, kupacs, uplata, intent, lastUplataDate, onClose}: UplataDialogProps) {

    const [kupac, setKupac] = useState<Kupac | undefined>(kupacs.find(kupac => kupac.id === uplata?.kupac_id));

    useEffect(() => {
        console.log(`Kupac ${uplata?.kupac_id} set to`);
        console.log(kupac);
        console.log(kupacs.length);
    }, [kupac, uplata]);

    const [kupacPickerOpen, setKupacPickerOpen] = useState<boolean>(false);

    const onKupacPickerDialogClose = useCallback(() => {
        setKupacPickerOpen(false);
    }, []);

    return <Dialog open={open} onClose={() => { onClose(false, intent) }} maxWidth='lg' fullWidth>
        <DialogTitle>{intent === 'create' ? 'Nova uplata' : 'Izmena uplate'}</DialogTitle>
        <DialogContent style={{display: 'flex', flexDirection: 'column'}}>
            <TextField value={kupac?.ime ?? ''}
                       contentEditable={false}
                       slotProps={{
                           input: {
                               endAdornment: <InputAdornment position='end'><Button onClick={() => { setKupacPickerOpen(true); }}>Izaberi kupca</Button></InputAdornment>
                           }
                       }}
            />
        </DialogContent>
        <DialogActions>
            <Button>Otkaži</Button>
            <Button>Sačuvaj</Button>
        </DialogActions>
        <KupacPickerDialog open={kupacPickerOpen} onSelectKupac={setKupac} kupacs={kupacs} onClose={onKupacPickerDialogClose} />
    </Dialog>
}

