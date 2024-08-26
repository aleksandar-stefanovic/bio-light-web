import Cena from '../Cena';
import supabase from '../../supabase/client';
import Kupac from '../Kupac';

export async function getForKupac(kupac: Kupac): Promise<Cena[]> {
    const {data, error} = await supabase.from('cene').select('*').eq('kupac_id', kupac.id);
    if (error) {
        throw error;
    }
    return data;
}
