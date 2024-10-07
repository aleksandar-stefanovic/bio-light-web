import Invoice from '../Invoice.ts';
import supabase from '../../supabase/client';
import _ from 'lodash';

class InvoiceDao {
    async getAll(): Promise<Invoice[]> {
        const {data, error} = await supabase.from('invoices').select('*').order('id', {ascending: false});
        if (error) {
            throw error;
        }

        data?.forEach(invoice => {
            invoice.date = new Date(invoice.date);
            invoice.date_due = new Date(invoice.date_due);
        });

        return data;
    }

    async insertOne(invoice: Invoice): Promise<Invoice> {
        const withoutId = _.omit(invoice, 'id');
        const {data, error} = await supabase.from('invoices')
        .insert(withoutId)
        .select();

        if (error) {
            console.error(error);
            throw error;
        }

        return data[0];
    }

    async updateOne(invoice: Partial<Invoice>): Promise<Invoice> {
        if (!invoice.id) {
            throw new Error('ID must be provided when updating invoices.');
        }
        const {data, error} = await supabase.from('invoices')
        .update(invoice)
        .eq('id', invoice.id)
        .select();

        if (error) {
            console.error(error);
            throw error;
        }

        return data[0];
    }
}

export default new InvoiceDao();
