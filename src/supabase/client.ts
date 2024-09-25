import {createClient} from '@supabase/supabase-js';

const publicAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtcHN0Z2R4aGRqbGx4cXlrZ3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjcyMTI1MDksImV4cCI6MjA0Mjc4ODUwOX0.fpq6nqbzwOIyyknMNp0sraN1hQEqZDyEg9O97WPrftw';
export default createClient('https://xmpstgdxhdjllxqykguf.supabase.co', publicAnonKey);
