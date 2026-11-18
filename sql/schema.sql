-- ===========================================================
-- SASPI CODE — IFTO Palmas — schema.sql  (inscrições nos JOGOS)
-- Cole TUDO no Supabase > SQL Editor > Run.  Pode rodar de novo.
--
-- SEGURANÇA:
--  * visitantes (anon) só conseguem INSERIR — nunca ler, editar ou apagar;
--  * só o(s) e-mail(s) de administrador listado(s) abaixo leem/exportam;
--  * validações no banco impedem dados lixo mesmo que ignorem o site.
-- ===========================================================

-- ⚠ JÁ CRIOU TABELAS DE VERSÕES ANTERIORES? Se só têm dados de teste, rode ANTES:
--     drop table if exists public.inscricoes;          -- formulário do evento (removido)
--     drop table if exists public.inscricoes_jogos;    -- versão sem e-mail/telefone
--   Se já tem inscrições reais, exporte (Table Editor > Export CSV) antes de apagar.

-- >>> TROQUE pelo(s) e-mail(s) que poderão ver os inscritos <<<
create or replace function public.is_saspi_admin()
returns boolean
language sql stable
as $$
  select coalesce(
    (auth.jwt() ->> 'email') = any (array[
      'alunos@ifto.edu.br'
      -- , 'outro.admin@ifto.edu.br'
    ]),
    false
  );
$$;

create table if not exists public.inscricoes_jogos (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  nome        text not null check (char_length(trim(nome)) between 3 and 120),
  email       text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 160),
  telefone    text not null check (char_length(regexp_replace(telefone, '\D', '', 'g')) between 10 and 11),
  aluno_ifto  boolean not null,
  matricula   text check (matricula is null or char_length(trim(matricula)) between 4 and 30),
  faculdade   text check (faculdade is null or char_length(trim(faculdade)) between 2 and 120),
  periodo     text check (periodo is null or char_length(trim(periodo)) between 1 and 30),
  jogo        text not null check (jogo in ('Arcade Sprint', 'LAN // IFTO', 'Game Jam 90''')),
  -- IFTO: matrícula. Não-IFTO: faculdade + período.
  constraint jogos_vinculo_ck check (
    (aluno_ifto and matricula is not null)
    or (not aluno_ifto and faculdade is not null and periodo is not null)
  )
);

-- evita inscrição repetida no mesmo jogo
create unique index if not exists jogos_email_uq     on public.inscricoes_jogos (jogo, lower(email));
create unique index if not exists jogos_matricula_uq on public.inscricoes_jogos (jogo, matricula) where matricula is not null;

alter table public.inscricoes_jogos enable row level security;

drop policy if exists "anon pode inserir jogo" on public.inscricoes_jogos;
drop policy if exists "admin le jogos"         on public.inscricoes_jogos;
drop policy if exists "admin apaga jogos"      on public.inscricoes_jogos;

create policy "anon pode inserir jogo" on public.inscricoes_jogos
  for insert to anon with check (true);
create policy "admin le jogos" on public.inscricoes_jogos
  for select to authenticated using (public.is_saspi_admin());
create policy "admin apaga jogos" on public.inscricoes_jogos
  for delete to authenticated using (public.is_saspi_admin());

revoke select, update, delete on public.inscricoes_jogos from anon;
grant  insert on public.inscricoes_jogos to anon;
grant  select, delete on public.inscricoes_jogos to authenticated;
