import {Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField} from '@mui/material';
import Kupac from '../data/Kupac';
import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import SearchBar from '../component/SearchBar';

interface KupacDialogProps {
    open: boolean;
    kupac: Kupac;
    onClose: (save: boolean) => void;
}

export default function KupacDialog({open, kupac, onClose}: KupacDialogProps) {

    const [ime, setIme] = React.useState(kupac.ime);
    const [adresa, setAdresa] = React.useState(kupac.adresa);
    const [pib, setPib] = React.useState(kupac.pib);
    const [mbr, setMbr] = React.useState(kupac.mbr);
    const [tkr, setTkr] = React.useState(kupac.tkr);
    const [rabat, setRabat] = React.useState(kupac.rabat);
    const [valuta, setValuta] = React.useState(kupac.valuta);
    const [otpremljenoNaziv, setOtpremljenoNaziv] = React.useState(kupac.otpremljeno_naziv);
    const [otpremljenoUlica, setOtpremljenoUlica] = React.useState(kupac.otpremljeno_ulica);
    const [otpremljenoMesto, setOtpremljenoMesto] = React.useState(kupac.otpremljeno_mesto);
    const [aktivan, setAktivan] = React.useState(kupac.aktivan);

    React.useEffect(() => {
        if (open) {
            setIme(kupac.ime);
            setAdresa(kupac.adresa);
            setPib(kupac.pib);
            setMbr(kupac.mbr);
            setTkr(kupac.tkr);
            setRabat(kupac.rabat);
            setValuta(kupac.valuta);
            setOtpremljenoNaziv(kupac.otpremljeno_naziv);
            setOtpremljenoUlica(kupac.otpremljeno_ulica);
            setOtpremljenoMesto(kupac.otpremljeno_mesto);
            setAktivan(kupac.aktivan);
        }
    }, [kupac, open]);

    return <Dialog open={open}
                   onClose={onClose}
                   fullWidth
                   maxWidth="xl"
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
        <DialogContent style={{padding: 10}}>
            <TextField label="Naziv"
                       value={ime}
                       fullWidth
                       onChange={event => setIme(event.target.value)}/>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => onClose(false)}>Zatvori</Button>
            <Button disabled variant='contained'>Sačuvaj izmene</Button>
        </DialogActions>
    </Dialog>
}