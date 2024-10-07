import LineItem from '../LineItem.ts';
import supabase from '../../supabase/client';
import {InvoiceId} from '../Invoice.ts';

class LineItemDao {
  async getByInvoiceId(invoiceId: InvoiceId): Promise<LineItem[]> {
    const {data, error} = await supabase.from('line_items').select('*').eq('invoice_id', invoiceId);
    if (error) {
      throw error;
    }
    return data;
  }

  async insert(lineItems: LineItem[]): Promise<void> {
    supabase.from('line_items').upsert(lineItems);
  }
}

export default new LineItemDao();
