-- Create waitlist table
create table if not exists waitlist (
    id uuid primary key default gen_random_uuid(),
    email text unique not null,
    created_at timestamptz not null default now(),
    notified boolean not null default false
);

-- Add index for faster lookups
create index if not exists waitlist_email_idx on waitlist(email);
create index if not exists waitlist_created_at_idx on waitlist(created_at desc);

-- Enable RLS
alter table waitlist enable row level security;

-- Allow anyone to insert (join waitlist)
create policy "anyone_can_join_waitlist" on waitlist
    for insert
    with check (true);

-- Only admins can view waitlist
create policy "admins_can_view_waitlist" on waitlist
    for select
    using (is_admin(auth.uid()));
