import supabase from '../../supabase/client';
import Product from '../Product.ts';

class ProductDao {
  async getAll(): Promise<Product[]> {
    const {data, error} = await supabase.from('products').select('*').eq('active', true).order('order_no');
    if (error) {
      throw error;
    }
    return data;
  }
}

export default new ProductDao();
