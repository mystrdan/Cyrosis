alter table public.knowledge_documents
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

create index if not exists research_sessions_user_id_idx
  on public.research_sessions(user_id);

create index if not exists research_messages_session_id_idx
  on public.research_messages(session_id);

create index if not exists knowledge_documents_user_id_idx
  on public.knowledge_documents(user_id);

drop policy if exists "public knowledge readable" on public.knowledge_documents;

create policy "users read own or shared knowledge"
  on public.knowledge_documents for select
  to authenticated
  using (user_id is null or user_id = auth.uid());

create policy "users insert own knowledge"
  on public.knowledge_documents for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "users update own knowledge"
  on public.knowledge_documents for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "users delete own knowledge"
  on public.knowledge_documents for delete
  to authenticated
  using (user_id = auth.uid());

alter table public.research_sessions
  alter column user_id set not null;
