import Customer, {CustomerId} from '../Customer.ts';
import supabase from '../../supabase/client';
import Transaction from '../Transaction.ts';
import _ from 'lodash';

export async function getAll(): Promise<Customer[]> {
    const {data, error} = await supabase.from('customers').select('*');
    if (error) {
        throw error;
    }
    return data;
}

export async function getAllTransactions(customerId: CustomerId): Promise<Transaction[]> {
    const invoicesPromise = supabase.from('invoices').select('*').eq('customer_id', customerId);
    const paymentsPromise = supabase.from('payments').select('*').eq('customer_id', customerId);
    const [invoicesResponse, paymentsResponse] = await Promise.all([invoicesPromise, paymentsPromise]);
    if (invoicesResponse.error) {
        throw invoicesResponse.error;
    }
    if (paymentsResponse.error) {
        throw paymentsResponse.error;
    }
    const transactions: Transaction[] = [...invoicesResponse.data, ...paymentsResponse.data];
    return _.sortBy(transactions, transaction => transaction.date);
}
