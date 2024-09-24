export type CustomerId = number;

export default interface Customer {
  id: CustomerId;
  name: string;
  address: string;
  tin: string;
  id_no: string;
  account_no: string;
  active: boolean;
  payment_period: number;
  delivery_name: string;
  delivery_street: string;
  delivery_city?: string;
  balance: number;
}
