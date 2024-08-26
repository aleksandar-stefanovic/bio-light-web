import supabase from '../../supabase/client';

export default abstract class Dao<T> {
    protected abstract relationName: string;
}
