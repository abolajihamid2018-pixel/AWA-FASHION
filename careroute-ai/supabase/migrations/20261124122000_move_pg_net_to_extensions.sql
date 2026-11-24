-- Keep pg_net out of the public schema (Supabase security advisor). Its functions live in the `net` schema either way.
drop extension if exists pg_net;
create extension pg_net schema extensions;
