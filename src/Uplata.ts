import Kupac from "./data/Kupac";
import Racun from './data/Racun';

export interface Uplata {
    id?: number;
    kupac: Kupac;
    racun?: Racun;
    iznos: number;
    datum: Date;
}