import StProizvod from '../StProizvod';
import supabase from '../../supabase/client';

class StProizvodDao {
  async getAll() {
    const {data, error} = await supabase.from('stproizvodi').select('*');
    if (error) {
      throw error;
    }
    return data;
  }

  async getByRacunId(racunId: number): Promise<StProizvod[]> {
    const {data, error} = await supabase.from('st_proizvodi').select('*').eq('racun_id', racunId);
    if (error) {
      throw error;
    }
    return data;
  }

  async insert(stProizvods: StProizvod[]): Promise<any> {
    return supabase.from('stproizvodi').insert(stProizvods);
  }
}

export default new StProizvodDao();
