import Customer, {CustomerId} from '../Customer.ts';
import supabase from '../../supabase/client';
import Transaction from '../Transaction.ts';
import _ from 'lodash';

export async function getAll(): Promise<Customer[]> {
    const {data, error} = await supabase.from('customers').select('*').order('id');
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

    invoicesResponse.data.forEach(invoice => {
        invoice.date = new Date(invoice.date);
        invoice.date_due = new Date(invoice.date_due);
    });

    paymentsResponse.data.forEach(payment => {
        payment.date = new Date(payment.date);
    })

    const transactions: Transaction[] = [...invoicesResponse.data, ...paymentsResponse.data];
    // sortBy performs a stable sort, so in case an invoice and a payment have the same date, invoices will be earlier in the sequence
    return _.sortBy(transactions, transaction => transaction.date);
}

export async function updateOne(customer: (Partial<Customer> & {id: CustomerId})) {
    const {data, error} = await supabase.from('customers')
    .update(customer)
    .eq('id', customer.id)
    .select();

    if (error) {
        console.error(error);
        throw error;
    }

    return data[0];
}
