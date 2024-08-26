import StProizvod from './StProizvod';
import Kupac from './Kupac';

export default interface Racun {
  id: number;
  rb: string;
  kupac: Kupac;
  datum: Date;
  datum_valute: Date;
  stproizvodi: StProizvod[];
  iznos: number;
  popust: number;
  za_uplatu: number;
}
