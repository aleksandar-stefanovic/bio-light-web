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
import Customer from '../data/Customer.ts';
import React from 'react';
import SearchBar from "../component/SearchBar";
import CloseIcon from '@mui/icons-material/Close';
import {useRepository} from '../repository/Repository.tsx';

export interface CustomerDialogPickerProps {
  open: boolean;
  onSelectCustomer: (customer: Customer) => void;
  onClose: () => void;
}

export default function CustomerPickerDialog({open, onSelectCustomer, onClose}: CustomerDialogPickerProps) {

  const {customers} = useRepository();

  const [searchTerm, setSearchTerm] = React.useState<string>('');

  const searchTerms = searchTerm.trim().toLowerCase().split(/\s+/)

  const filteredCustomers = customers.map(customer => {
    return {
      customer: customer,
      count: searchTerms.filter(searchTerm => customer.name.toLowerCase().includes(searchTerm)).length
    }
  })
    .filter(it => it.count > 0)
    .sort((a, b) => {
      if (a.customer.active && !b.customer.active) {
        return -1;
      }
      if (!a.customer.active && b.customer.active) {
        return 1;
      }
      return b.count - a.count;
    })
    .map(({customer}) => customer);

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
        {filteredCustomers.map(kupac =>
            <ListItem key={kupac.id} disablePadding>
              <ListItemButton onClick={() => onSelectCustomer(kupac)} style={{opacity: kupac.active ? 1 : 0.7}}>
                <ListItemText>{kupac.name}</ListItemText>
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
