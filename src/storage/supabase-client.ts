import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://xmpstgdxhdjllxqykguf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtcHN0Z2R4aGRqbGx4cXlrZ3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njk0NzczODIsImV4cCI6MTk4NTA1MzM4Mn0.OnqC9ZudnUmr1_wg6j_fpFpsGCJLp631JTaVAa4klK0')

export default supabase