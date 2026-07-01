import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://kpcprtpmhzpguwwnocnu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_d4NP_ug3qKkUA4wKmtyMKA_dx8wxF36";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    flowType: "pkce",
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
