import Dao from './Dao';
import Proizvod from '../Proizvod';
import supabase from '../../supabase/client';

class ProizvodDao extends Dao<Proizvod> {
  relationName = 'proizvodi';

  async getAll() {
    const {data, error} = await supabase.from('proizvodi').select('*').eq('aktivan', true).order('na_spisku');
    if (error) {
      throw error;
    }
    return data;
  }
}

export default new ProizvodDao();
