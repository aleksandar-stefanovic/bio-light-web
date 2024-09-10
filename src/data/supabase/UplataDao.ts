import supabase from '../../supabase/client';
import {DbUplata, Uplata} from '../Uplata.ts';

export async function getRangeLast(skip: number, count: number): Promise<DbUplata[]> {
    const {data, error} = await supabase.from('uplate').select('*')
    .order('datum', {ascending: false})
    .range(skip, skip + count);

    if (error) {
        throw error;
    }

    return data;
}

export async function getCount() {
    const {count, error} = await supabase.from('uplate').select('*', {count: 'exact', head: true});

}