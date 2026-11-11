-- Nigeria localisation: HMO / health insurance enquiries are a common front-desk request.
insert into public.services (slug, name, description, kind, sort_order) values
  ('hmo-insurance', 'HMO / health insurance enquiry', 'Questions about HMO registration, cover or approval codes for your visit.', 'administrative', 55)
on conflict (slug) do nothing;
