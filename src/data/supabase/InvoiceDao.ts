import Invoice from '../Invoice.ts';
import supabase from '../../supabase/client';

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

    async insertOne(invoice: Omit<Invoice, 'id'>): Promise<Invoice> {
        const {data, error} = await supabase.from('invoices')
        .insert(invoice)
        .select();

        if (error) {
            console.error(error);
            throw error;
        }

        return data[0];
    }

    async updateOne(invoice: Partial<Invoice>): Promise<Invoice> {
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
