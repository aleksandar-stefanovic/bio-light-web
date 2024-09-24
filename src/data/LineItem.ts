export default interface LineItem {
  order_no: number;
  invoice_no: number;
  product_id: number;
  count: number;
  discount_perc: number;
  amount: number;
  bulk: boolean;
  ean: string;
  name: string;
  unit: string;
  amount_before_discount: number;
  price: number;
}
