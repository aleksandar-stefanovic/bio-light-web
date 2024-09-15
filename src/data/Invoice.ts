import StProizvod from './StProizvod';
import {KupacId} from './Kupac';

export type InvoiceId = number;

export default interface Invoice {
  id: InvoiceId;
  rb: string;
  kupac_id: KupacId;
  datum: Date;
  datum_valute: Date;
  stproizvodi: StProizvod[];
  iznos: number;
  popust: number;
  za_uplatu: number;
  saldo: number;
}
