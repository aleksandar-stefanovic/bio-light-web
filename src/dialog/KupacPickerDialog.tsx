import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle, IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText
} from '@mui/material';
import Kupac from '../data/Kupac';
import React from 'react';
import SearchBar from "../component/SearchBar";
import CloseIcon from '@mui/icons-material/Close';

interface KupacDialogPickerProps {
  open: boolean;
  onSelectKupac: (kupac: Kupac) => void;
  onClose: () => void;
  kupacs: Kupac[];
}

export default function KupacPickerDialog({open, onSelectKupac, onClose, kupacs}: KupacDialogPickerProps) {

  const [searchTerm, setSearchTerm] = React.useState<string>('');

  const searchTerms = searchTerm.trim().toLowerCase().split(/\s+/)

  const filteredKupacs = kupacs.map(kupac => {
    return {
      kupac,
      count: searchTerms.filter(searchTerm => kupac.ime.toLowerCase().includes(searchTerm)).length
    }
  })
    .filter(it => it.count > 0)
    .sort((a, b) => {
      if (a.kupac.aktivan && !b.kupac.aktivan) {
        return -1;
      }
      if (!a.kupac.aktivan && b.kupac.aktivan) {
        return 1;
      }
      return b.count - a.count;
    })
    .map(({kupac}) => kupac)

  return <Dialog open={open}
                 fullWidth
                 maxWidth="xl"
                 PaperProps={{ style: {
                     minHeight: '90%',
                     maxHeight: '90%',
                   }}}>
    <DialogTitle>
      <div style={{display: 'flex', justifyContent: 'space-between'}}>
        <p style={{margin: 0}}>Izaberi kupca</p>
        <IconButton onClick={onClose}>
          <CloseIcon/>
        </IconButton>
      </div>
      <SearchBar onSearchTerm={setSearchTerm} timeout={0} style={{width: '100%'}}/>
    </DialogTitle>
    <DialogContent style={{height: '100%'}}>
      <List style={{height: '100%'}}>
        {filteredKupacs.map(kupac =>
            <ListItem key={kupac.id} disablePadding>
              <ListItemButton onClick={() => onSelectKupac(kupac)} style={{opacity: kupac.aktivan ? 1 : 0.7}}>
                <ListItemText>{kupac.ime}</ListItemText>
              </ListItemButton>
            </ListItem>)
        }
      </List>
    </DialogContent>
    <DialogActions>
      <Button variant='outlined' onClick={onClose}>Zatvori</Button>
    </DialogActions>
  </Dialog>
}
