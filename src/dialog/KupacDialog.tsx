import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle, FormControlLabel,
    IconButton,
    TextField, Typography
} from '@mui/material';
import Kupac from '../data/Kupac';
import React, {useEffect, useMemo, useState} from 'react';
import CloseIcon from '@mui/icons-material/Close';
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import * as CenaDao from '../data/supabase/CenaDao.ts';
import Cena from '../data/Cena.ts';
import Proizvod from '../data/Proizvod.ts';

interface KupacDialogProps {
    open: boolean;
    kupac: Kupac;
    proizvods: Proizvod[];
    onClose: (save: boolean) => void;
}

export default function KupacDialog({open, kupac, proizvods, onClose}: KupacDialogProps) {

    const [ime, setIme] = React.useState(kupac.ime);
    const [adresa, setAdresa] = React.useState(kupac.adresa);
    const [pib, setPib] = React.useState(kupac.pib);
    const [mbr, setMbr] = React.useState(kupac.mbr);
    const [tkr, setTkr] = React.useState(kupac.tkr);
    const [valuta, setValuta] = React.useState(kupac.valuta);
    const [otpremljenoNaziv, setOtpremljenoNaziv] = React.useState(kupac.otpremljeno_naziv);
    const [otpremljenoUlica, setOtpremljenoUlica] = React.useState(kupac.otpremljeno_ulica);
    const [otpremljenoMesto, setOtpremljenoMesto] = React.useState(kupac.otpremljeno_mesto);
    const [aktivan, setAktivan] = React.useState(kupac.aktivan);
    const [cene, setCene] = useState<Cena[]>([]);

    useEffect(() => {
        if (open) {
            setIme(kupac.ime);
            setAdresa(kupac.adresa);
            setPib(kupac.pib);
            setMbr(kupac.mbr);
            setTkr(kupac.tkr);
            setValuta(kupac.valuta);
            setOtpremljenoNaziv(kupac.otpremljeno_naziv);
            setOtpremljenoUlica(kupac.otpremljeno_ulica);
            setOtpremljenoMesto(kupac.otpremljeno_mesto);
            setAktivan(kupac.aktivan);
            CenaDao.getForKupac(kupac).then(cene => {
                const filteredCene = cene.filter(cena => proizvods.some(proizvod => proizvod.id === cena.proizvod_id))
                setCene(filteredCene)
            }).catch(error => {
                window.alert(`Greška pri učitavanju cena (${error})`)
            })
        }
    }, [kupac, open]);

    const pricingColumns: GridColDef[] = useMemo(() => [
        {headerName: 'RB', field: 'proizvod_id'},
        {headerName: 'Ime', field: 'ime', valueGetter: (_, row) => proizvods.find((proizvod) => proizvod.id === row.proizvod_id)?.ime, flex: 2},
        {headerName: 'Kratko ime', field: 'kratko_ime', valueGetter: (_, row) => proizvods.find((proizvod) => proizvod.id === row.proizvod_id)?.kratko_ime, flex: 1},
        {headerName: 'Cena kom', field: 'kom', editable: true},
        {headerName: 'Cena kg', field: 'kg', editable: true},
        {headerName: 'Rabat kom', field: 'rabat_kom', editable: true},
        {headerName: 'Rabat kg', field: 'rabat_kg', editable: true}
    ], [proizvods]);

    return <Dialog open={open}
                   onClose={onClose}
                   fullWidth
                   maxWidth="lg"
                   PaperProps={{
                       style: {
                           minHeight: '90%',
                           maxHeight: '90%',
                       }
                   }}>
        <DialogTitle>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <p style={{margin: 0}}>{kupac.ime}</p>
                <IconButton onClick={() => onClose(false)}>
                    <CloseIcon/>
                </IconButton>
            </div>
        </DialogTitle>
        <DialogContent style={{padding: 10, overflowY: 'auto'}}>
            <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
                <TextField label="Naziv"
                           value={ime}
                           fullWidth
                           onChange={event => setIme(event.target.value)} />
                <TextField label="Adresa"
                           value={adresa}
                           fullWidth
                           onChange={event => setAdresa(event.target.value)} />
                <TextField label="PIB"
                           value={pib}
                           fullWidth
                           onChange={event => setPib(event.target.value)} />
                <TextField label="MBR"
                           value={mbr}
                           fullWidth
                           onChange={event => setMbr(event.target.value)} />
                <TextField label="TKR"
                           value={tkr}
                           fullWidth
                           onChange={event => setTkr(event.target.value)} />
                <TextField label="Valuta"
                           value={valuta}
                           fullWidth
                           onChange={event => setValuta(Number(event.target.value))} />
                <TextField label="Naziv (otpremljeno)"
                           value={otpremljenoNaziv}
                           fullWidth
                           onChange={event => setOtpremljenoNaziv(event.target.value)} />
                <TextField label="Ulica (otpremljeno)"
                           value={otpremljenoUlica}
                           fullWidth
                           onChange={event => setOtpremljenoUlica(event.target.value)} />
                <TextField label="Mesto (otpremljeno)"
                           value={otpremljenoMesto}
                           fullWidth
                           onChange={event => setOtpremljenoMesto(event.target.value)} />
                <FormControlLabel label="Aktivan"
                                  control={<Checkbox checked={aktivan}
                                                     onChange={event => setAktivan(event.target.checked)}/>}
                />

                <Typography variant='h6'>Cene</Typography>
                <Typography variant='caption'>Da bi se izmenila cena, kliknuti dvaput na cenu</Typography>

                <DataGrid
                    columns={pricingColumns}
                    rows={cene}
                    getRowId={row => row.proizvod_id}
                    hideFooter
                />
            </div>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => onClose(false)}>Zatvori</Button>
            <Button disabled variant='contained'>Sačuvaj izmene</Button>
        </DialogActions>
    </Dialog>
}