import Racun from './Racun';
import Uplata from './Uplata';

export type KupacId = number;

export default interface Kupac {
  id?: KupacId;
  ime: string;
  adresa: string;
  pib: string;
  mbr: string;
  tkr: string;
  aktivan: boolean;
  rabat: number;
  valuta: number;
  otpremljeno_naziv: string;
  otpremljeno_ulica: string;
  otpremljeno_mesto?: string;
  racuni: Racun[];
  uplate: Uplata[];
  stanje: number;
}
