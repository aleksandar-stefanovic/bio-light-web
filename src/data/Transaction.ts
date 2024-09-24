import Invoice from './Invoice.ts';
import Payment from './Payment.ts';

type Transaction = Invoice | Payment;
export default Transaction;
