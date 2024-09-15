import Invoice from '../Invoice.ts';
import supabase from '../../supabase/client';
import StProizvodDao from './StProizvodDao.ts';
import {recalculateBalance} from './KupacDao.ts';

class InvoiceDao {
    async getNextInvoiceNo(): Promise<string> {
        const {data, error} = await supabase
        .from('racuni')
        .select('datum,rb')
        .order('datum', {ascending: false})
        .order('id', {ascending: false})
        .limit(1);

        if (error) {
            throw error;
        }

        const invoice = data[0];

        const currentYear = new Date().getFullYear();

        if (!invoice) {
            return `1/${currentYear}`
        }

        const invoiceYear = new Date(invoice.datum).getFullYear();

        const yearSuffix = currentYear % 100;

        if (invoiceYear !== currentYear) {
            return `1/${yearSuffix}`;
        } else {
            const rb = Number((invoice.rb as string).split('/')[0]);
            return `${rb + 1}/${yearSuffix}`;
        }
    }

    async getAll(): Promise<Invoice[]> {
        const {data, error} = await supabase.from('racuni').select('*').order('id', {ascending: false});
        if (error) {
            throw error;
        }

        data?.forEach(invoice => {
            invoice.datum = new Date(invoice.datum);
            invoice.datum_valute = new Date(invoice.datum_valute);
        });

        return data;
    }

    async getRangeLast(skip: number, count: number): Promise<Invoice[]> {
        const {data, error} = await supabase
        .from('racuni')
        .select('*')
        .order('id', {ascending: false})
        .range(skip, skip + count)
        if (error) {
            throw error;
        }
        return data;
    }

    async insert(invoice: Invoice): Promise<Invoice> {
        const {data, error} = await supabase.from('racuni').insert({
            rb: invoice.rb,
            kupac_id: invoice.kupac_id,
            datum: invoice.datum,
            datum_valute: invoice.datum_valute,
            iznos: invoice.iznos,
            popust: invoice.popust,
            za_uplatu: invoice.za_uplatu,
            saldo: invoice.saldo
        } satisfies Partial<Invoice>)
        .select();

        if (error) {
            console.error(error);
            throw error;
        }

        try {
            await recalculateBalance(invoice.kupac_id);
        } catch (error) {
            console.error(error);
            throw error;
        }

        const [{id}] = data;
        invoice.id = id;
        const stProizvods = [...invoice.stproizvodi];
        stProizvods.forEach(proizvod => proizvod.racun_id = id);
        try {
            await StProizvodDao.insert(stProizvods);
        } catch (error) {
            console.error(error);
            throw error;
        }
        return invoice;
    }

    async update(invoice: Invoice): Promise<Invoice> {
        const {data, error} = await supabase.from('racuni').update({
            kupac_id: invoice.kupac_id,
            datum: invoice.datum,
            datum_valute: invoice.datum_valute,
            iznos: invoice.iznos,
            popust: invoice.popust,
            za_uplatu: invoice.za_uplatu,
            saldo: 0 // TODO
        }).eq('id', invoice.id)
    }
}

export default new InvoiceDao();
