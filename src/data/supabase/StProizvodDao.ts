import StProizvod from '../StProizvod';
import supabase from '../../supabase/client';
import type {PostgrestSingleResponse} from '@supabase/supabase-js';
import {RacunId} from '../Racun.ts';

class StProizvodDao {
  async getByRacunId(racunId: RacunId): Promise<StProizvod[]> {
    const {data, error} = await supabase.from('st_proizvodi').select('*').eq('racun_id', racunId);
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
