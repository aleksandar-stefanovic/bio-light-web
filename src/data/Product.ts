export default interface Product {
  id: number;
  name: string;
  short_name: string;
  suffix_piece: string;
  suffix_kg: string;
  ean: string;
  ean_kg?: string;
  active: boolean;
  order_no: number;
}
