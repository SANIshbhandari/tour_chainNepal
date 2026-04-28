-- Create a function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'tourist')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Create a trigger to automatically create user records
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill existing auth users who don't have user records
insert into public.users (id, email, display_name, role)
select 
  au.id,
  au.email,
  coalesce(au.raw_user_meta_data->>'display_name', split_part(au.email, '@', 1)),
  coalesce(au.raw_user_meta_data->>'role', 'tourist')
from auth.users au
where not exists (
  select 1 from public.users u where u.id = au.id
)
on conflict (id) do nothing;
