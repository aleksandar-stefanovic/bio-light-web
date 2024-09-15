import Kupac, {KupacId} from '../Kupac';
import supabase from '../../supabase/client';
import Promena from '../Promena';
import _ from 'lodash';

export async function getAll(): Promise<Kupac[]> {
    const {data, error} = await supabase.from('kupci').select('*');
    if (error) {
        throw error;
    }
    return data;
}

export async function getAllPromenas(kupacId: KupacId, invoicesSelect: string = '*', paymentsSelect: string = '*'): Promise<Promena[]> {
    const invoicesPromise = supabase.from('racuni').select(invoicesSelect as '*').eq('kupac_id', kupacId);
    const uplatasPromise = supabase.from('uplate').select(paymentsSelect as '*').eq('kupac_id', kupacId);
    const [invoicesResponse, uplatasResponse] = await Promise.all([invoicesPromise, uplatasPromise]);
    if (invoicesResponse.error) {
        throw invoicesResponse.error;
    }
    if (uplatasResponse.error) {
        throw uplatasResponse.error;
    }
    const promenas: Promena[] = [...invoicesResponse.data, ...uplatasResponse.data];
    return _.sortBy(promenas, (promena) => promena.datum);
}

/** Reclaculates balance for all the related Invoices, Payments and finally the Customer. */
export async function recalculateBalance(kupacId: KupacId) {

    const promenas = await getAllPromenas(kupacId, 'id, za_uplatu, datum, datum_valute', 'id, iznos, datum');

    let balance = 0;
    promenas.forEach(promena => {
        const isInvoice = 'datum_valute' in promena;
        if (isInvoice) {
            balance += promena.za_uplatu;
        } else {
            balance -= promena.iznos;
        }
        promena.saldo = balance;
    });



    await supabase.from('kupci').update({stanje: balance}).eq('id', kupacId);
}
