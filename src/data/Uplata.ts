export default interface Uplata {
    id?: number;
    kupac_id: number;
    invoice_id?: number;
    iznos: number;
    datum: Date;
    saldo: number;
}