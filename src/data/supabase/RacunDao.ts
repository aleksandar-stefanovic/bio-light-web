import Racun from '../Racun';
import supabase from '../../supabase/client';
import {sortBy, reverse} from 'lodash';

class RacunDao {
    async getNextRacunRb(): Promise<string> {
        const {data, error} = await supabase
        .from('racuni')
        .select('datum,rb')
        .order('datum', {ascending: false})
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

    async insert(...racuns: Racun[]): Promise<Racun[]> {
        // return Promise.all(racuns.map(async (racun) => {
        //     const racunDto = {
        //         rb: racun.rb,
        //         kupac_id: racun.kupac.id,
        //         datum: racun.datum,
        //         datum_valute: racun.datum_valute,
        //         iznos: racun.iznos,
        //         popust: racun.popust,
        //         za_uplatu: racun.za_uplatu
        //     };
        //     const [savedRacun] = await super.insert(racunDto);
        //     savedRacun.stproizvodi = [...racun.stproizvodi];
        //     const stProizvods = [...racun.stproizvodi];
        //     stProizvods.forEach(proizvod => proizvod.racun_id = savedRacun.id || 0);
        //     await StProizvodDao.insert(stProizvods);
        //     return savedRacun;
        // }));
        return [];
    }
}

export default new RacunDao();
