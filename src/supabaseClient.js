import { createClient } from "@supabase/supabase-js";


const redirectUrl =
  window.location.hostname === "localhost"
    ? "http://localhost:5173/home"
    : "https://proyecto-final-blond-ten.vercel.app/home";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      redirectTo: redirectUrl,
    },
  }
);

export default supabase;
