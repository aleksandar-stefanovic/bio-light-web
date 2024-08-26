export default interface Proizvod {
  id: number;
  ime: string;
  kratko_ime: string;
  nastavak_kom: string;
  nastavak_kg: string;
  ean: string;
  ean_rinfuz?: string;
  aktivan: boolean;
  na_spisku: number;
}
