import Kupac from '../Kupac';
import supabase from '../../supabase/client';
import Promena from './Promena';
import _ from 'lodash';

export async function getAll(): Promise<Kupac[]> {
    const {data, error} = await supabase.from('kupci').select('*');
    if (error) {
        throw error;
    }
    return data;
}

export async function getAllPromenas(kupac: Kupac): Promise<Promena[]> {
    const racunsPromise = supabase.from('racuni').select('*').eq('kupac_id', kupac.id);
    const uplatasPromise = supabase.from('uplate').select('*').eq('kupac_id', kupac.id);
    const [racunsResponse, uplatasResponse] = await Promise.all([racunsPromise, uplatasPromise]);
    if (racunsResponse.error) {
        throw racunsResponse.error;
    }
    if (uplatasResponse.error) {
        throw uplatasResponse.error;
    }
    const promenas: Promena[] = [...racunsResponse.data, ...uplatasResponse.data];
    return _.sortBy(promenas, (promena) => promena.datum);
}
