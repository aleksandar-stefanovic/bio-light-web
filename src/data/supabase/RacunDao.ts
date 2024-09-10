import Racun from '../Racun';
import supabase from '../../supabase/client';
import {sortBy, reverse} from 'lodash';
import StProizvodDao from './StProizvodDao.ts';
import {updateStanje} from './KupacDao.ts';

class RacunDao {
    async getNextRacunRb(): Promise<string> {
        const {data, error} = await supabase
        .from('racuni')
        .select('datum,rb')
        .order('datum', {ascending: false})
        .order('id', {ascending: false})
        .limit(1);

        if (error) {
            throw error;
        }

        const racun = data[0];

        const currentYear = new Date().getFullYear();

        if (!racun) {
            return `1/${currentYear}`
        }

        const racunYear = new Date(racun.datum).getFullYear();

        const yearSuffix = currentYear % 100;

        if (racunYear !== currentYear) {
            return `1/${yearSuffix}`;
        } else {
            const rb = Number((racun.rb as string).split('/')[0]);
            return `${rb + 1}/${yearSuffix}`;
        }
    }

    async getAll(): Promise<Racun[]> {
        const {data, error} = await supabase.from('racuni').select('*');
        if (error) {
            throw error;
        }
        return reverse(sortBy(data, 'datum'));
    }

    async getRangeLast(skip: number, count: number): Promise<Racun[]> {
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

    async insert(racun: Racun): Promise<Racun> {
        const {data, error} = await supabase.from('racuni').insert({
            rb: racun.rb,
            kupac_id: racun.kupac_id,
            datum: racun.datum,
            datum_valute: racun.datum_valute,
            iznos: racun.iznos,
            popust: racun.popust,
            za_uplatu: racun.za_uplatu,
            saldo: racun.saldo
        } satisfies Partial<Racun>)
        .select();

        if (error) {
            console.error(error);
            throw error;
        }

        try {
            await updateStanje(racun.kupac_id, racun.za_uplatu);
        } catch (error) {
            console.error(error);
            throw error;
        }

        const [{id}] = data;
        racun.id = id;
        const stProizvods = [...racun.stproizvodi];
        stProizvods.forEach(proizvod => proizvod.racun_id = id);
        try {
            await StProizvodDao.insert(stProizvods);
        } catch (error) {
            console.error(error);
            throw error;
        }
        return racun;
    }
}

export default new RacunDao();
