import TabProps from './TabProps.ts';
import {useCallback, useMemo, useState} from 'react';
import {Button} from '@mui/material';
import {DataGrid, GridColDef, GridRowSelectionModel} from '@mui/x-data-grid';
import dayjs from 'dayjs';
import PaymentDialog, {PaymentDialogProps} from '../dialog/PaymentDialog.tsx';
import {useRepository} from '../repository/Repository.tsx';
import Payment from '../data/Payment.ts';

export default function TabPayments({visible, style}: TabProps) {

    const {customers, payments} = useRepository();

    const closePaymentDialog = useCallback((confirmed: boolean, intent: 'create'|'edit', payment?: Payment) => {
        // TODO save the payment
        console.log(payment);
        setPaymentDialogProps(prevState => ({
            ...prevState,
            open: false
        }))
    }, []);

    const [paymentDialogProps, setPaymentDialogProps] = useState<PaymentDialogProps>({
        open: false,
        intent: 'create',
        onClose: closePaymentDialog
    });


    const onRowSelected = useCallback((rowSelectionModel: GridRowSelectionModel) => {
        const paymentId = rowSelectionModel[0];
        const payment = payments.find(payment => payment.id === paymentId)!;
        setPaymentDialogProps(prevState => ({...prevState, existingPayment: payment}));
    }, [payments]);

    const onCreatePaymentIntent = useCallback(() => {
        setPaymentDialogProps(prevState => ({
            ...prevState,
            open: true,
            existingPayment: undefined,
            intent: 'create'
        }));
    }, []);

    const onUpdatePaymentIntent = useCallback(() => {
        setPaymentDialogProps(prevState => ({
            ...prevState,
            open: true,
            intent: 'edit'
        }));
    }, []);

    const columns: GridColDef[] = useMemo(() => [
        {field: 'id', headerName: 'RB'},
        {
            field: 'customer_id',
            headerName: 'Kupac',
            valueGetter: value => customers.find(customer => customer.id === value)?.name ?? 'GREŠKA',
            width: 500
        },
        {
            field: 'date',
            headerName: 'Datum',
            valueGetter: value => dayjs(value).format('DD.MM.YYYY.'),
            align: 'right'
        },
        {field: 'amount', headerName: 'Iznos', valueGetter: value => Number(value).toFixed(2), align: 'right', headerAlign: 'right'}
    ], [customers]);

    return <div style={{...style, display: visible ? 'flex' : 'none', flexDirection: 'row', height: 1}}>
        <div style={{height: '100%', flex: 1}}>
            <DataGrid columns={columns} rows={payments} onRowSelectionModelChange={onRowSelected} />
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 10, padding: 10, minWidth: 150}}>
            <Button variant='outlined' size='small' onClick={onCreatePaymentIntent}>Dodaj uplatu</Button>
            <Button variant='outlined' size='small' onClick={onUpdatePaymentIntent}>Izmeni uplatu</Button>
        </div>

        <PaymentDialog {...paymentDialogProps} />
    </div>
}