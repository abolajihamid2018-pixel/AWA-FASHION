-- Fictional demo services for "Riverside Community Clinic" (synthetic data for the hackathon prototype).
insert into public.services (slug, name, description, kind, sort_order) values
  ('general-appointment',  'General appointment',      'Book a routine visit with one of the clinic''s practitioners.',                          'appointment',    10),
  ('follow-up',            'Follow-up appointment',    'Schedule a follow-up after a previous visit at the clinic.',                            'appointment',    20),
  ('vaccination',          'Vaccination appointment',  'Request a time slot for a routine vaccination appointment.',                            'appointment',    30),
  ('annual-checkup',       'Annual check-up',          'Book a yearly wellness check-up appointment.',                                         'appointment',    40),
  ('medical-records',      'Medical records request',  'Ask for a copy of your records or for records to be transferred to another provider.', 'administrative', 50),
  ('billing-insurance',    'Billing & insurance enquiry', 'Questions about invoices, payments or insurance paperwork.',                         'administrative', 60)
on conflict (slug) do nothing;
