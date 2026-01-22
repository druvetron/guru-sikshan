import { createClient } from '@supabase/supabase-js';

// ⚠️ REPLACE THESE WITH YOUR REAL KEYS FROM YOUR .ENV FILE OR DASHBOARD
const supabaseUrl = 'https://sueztfjexncmfntymjfn.supabase.co';
const supabaseKey = 'yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1ZXp0ZmpleG5jbWZudHltamZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODgyOTM4NSwiZXhwIjoyMDg0NDA1Mzg1fQ.R4varWuOCOjmm9ssVLYfZMGK-MIe1nDrkFbhxyeYuMI';

export const supabase = createClient(supabaseUrl, supabaseKey);