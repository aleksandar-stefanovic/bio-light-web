import {CustomerId} from './Customer.ts';

export type InvoiceId = number;

export default interface Invoice {
  id: InvoiceId;
  ref_no: string;
  customer_id: CustomerId;
  date: Date;
  date_due: Date;
  amount_before_discount: number;
  discount: number;
  amount: number;
  balance: number;
}
