import TabProps from './TabProps.ts';
import {useCallback, useMemo, useState} from 'react';
import {Button} from '@mui/material';
import {DataGrid, GridColDef, GridRowSelectionModel} from '@mui/x-data-grid';
import dayjs from 'dayjs';
import PaymentDialog, {PaymentDialogProps} from '../dialog/PaymentDialog.tsx';
import {useRepository} from '../repository/Repository.tsx';

export default function TabPayments({visible, style}: TabProps) {

    const {customers, payments} = useRepository();

    const closePaymentDialog = useCallback(() => {
        // TODO handle save
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
        setPaymentDialogProps(prevState => ({...prevState, payment: payment}));
    }, [payments]);

    const onCreatePaymentIntent = useCallback(() => {
        setPaymentDialogProps(prevState => ({
            ...prevState,
            open: true,
            payment: undefined,
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
        <div>
            <Button onClick={onCreatePaymentIntent}>Dodaj uplatu</Button>
            <Button onClick={onUpdatePaymentIntent}>Izmeni uplatu</Button>
        </div>

        <PaymentDialog {...paymentDialogProps} />
    </div>
}