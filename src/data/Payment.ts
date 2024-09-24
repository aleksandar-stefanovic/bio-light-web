export default interface Payment {
    id: number;
    customer_id: number;
    invoice_id?: number;
    amount: number;
    date: Date;
    balance: number;
}