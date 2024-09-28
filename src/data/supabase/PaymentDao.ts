import supabase from '../../supabase/client';
import Payment from '../Payment.ts';

export async function getAll(): Promise<Payment[]> {
    const {data, error} = await supabase.from('payments').select('*').order('id', {ascending: false});
    if (error) {
        throw error;
    }
    data?.forEach(payment => payment.date = new Date(payment.date))
    return data;
}

export async function getRangeLast(skip: number, count: number): Promise<Payment[]> {
    const {data, error} = await supabase.from('payments').select('*')
    .order('date', {ascending: false})
    .range(skip, skip + count);

    if (error) {
        throw error;
    }

    data?.forEach(payment => payment.date = new Date(payment.date))

    return data;
}