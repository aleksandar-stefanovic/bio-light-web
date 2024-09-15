import StProizvod from '../StProizvod';
import supabase from '../../supabase/client';
import type {PostgrestSingleResponse} from '@supabase/supabase-js';
import {InvoiceId} from '../Invoice.ts';

class StProizvodDao {
  async getByInvoiceId(invoiceId: InvoiceId): Promise<StProizvod[]> {
    const {data, error} = await supabase.from('st_proizvodi').select('*').eq('racun_id', invoiceId);
    if (error) {
      throw error;
    }
    return data;
  }

  async insert(stProizvods: StProizvod[]): Promise<PostgrestSingleResponse<null>> {
    return supabase.from('st_proizvodi').insert(stProizvods);
  }
}

export default new StProizvodDao();
