import Price from '../Price.ts';
import supabase from '../../supabase/client';
import Customer from '../Customer.ts';

export async function getForCustomer(customer: Customer): Promise<Price[]> {
    const {data, error} = await supabase.from('prices').select('*').eq('customer_id', customer.id);
    if (error) {
        throw error;
    }
    return data;
}

export async function upsertPrices(prices: Price[]): Promise<void> {
    const {error} = await supabase.from('prices').upsert(prices);

    if (error) {
        throw error;
    }
}
