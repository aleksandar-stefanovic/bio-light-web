import LineItem from '../LineItem.ts';
import supabase from '../../supabase/client';
import type {PostgrestSingleResponse} from '@supabase/supabase-js';
import {InvoiceId} from '../Invoice.ts';

class LineItemDao {
  async getByInvoiceId(invoiceId: InvoiceId): Promise<LineItem[]> {
    const {data, error} = await supabase.from('line_items').select('*').eq('invoice_id', invoiceId);
    if (error) {
      throw error;
    }
    return data;
  }

  async insert(lineItems: LineItem[]): Promise<PostgrestSingleResponse<null>> {
    return supabase.from('line_items').insert(lineItems);
  }
}

export default new LineItemDao();
