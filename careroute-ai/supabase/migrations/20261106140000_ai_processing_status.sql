-- CareRoute AI — milestone 3: allow an in-flight AI state so a request is only processed once at a time.
alter type public.ai_status add value if not exists 'processing' after 'pending';
