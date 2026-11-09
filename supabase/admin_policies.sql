-- Apply only after schema.sql. Authorization comes from server-controlled app_metadata,
-- never from user-editable user_metadata. Existing student/public policies remain in force.
grant insert, update on public.assistants to authenticated;
create policy "admins read all assistants" on public.assistants for select to authenticated
  using ((select auth.jwt()) -> 'app_metadata' ->> 'school_role' = 'admin');
create policy "admins insert assistants" on public.assistants for insert to authenticated
  with check ((select auth.jwt()) -> 'app_metadata' ->> 'school_role' = 'admin');
create policy "admins update assistants" on public.assistants for update to authenticated
  using ((select auth.jwt()) -> 'app_metadata' ->> 'school_role' = 'admin')
  with check ((select auth.jwt()) -> 'app_metadata' ->> 'school_role' = 'admin');
