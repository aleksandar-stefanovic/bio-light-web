import supabase from '../../supabase/client';
import Payment from '../Payment.ts';
import _ from 'lodash';

export async function getAll(): Promise<Payment[]> {
    const {data, error} = await supabase.from('payments').select('*').order('id', {ascending: false});
    if (error) {
        throw error;
    }
    data?.forEach(payment => payment.date = new Date(payment.date))
    return data;
}

export async function insertOne(payment: Payment): Promise<void> {
    const withoutId: Omit<Payment, 'id'> = _.omit(payment, 'id');
    const {data, error} = await supabase.from('payments').insert(withoutId).select();

    if (error) {
        throw error;
    }

    payment.id = data[0].id;
}

export async function updateOne(payment: Partial<Payment>): Promise<void> {
    const {error} = await supabase.from('payments').update(payment).eq('id', payment.id);

    if (error) {
        throw error;
    }
}