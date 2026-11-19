# SASPI Code — IFTO Palmas

Site da Semana Acadêmica de Sistemas para Internet. **HTML + CSS + JavaScript puro**, sem build.

https://iridescent-khapse-79843c.netlify.app

```
index.html        → site (hero, agenda, games + inscrição nos jogos, FAQ...)
admin.html        → painel da organização (login, lista, busca, filtros, exporta Excel/PDF/CSV)
css/style.css     → visual do site         css/admin.css → visual do painel
js/script.js      → interações, validação dos formulários
js/supabase.js    → gravação/leitura no banco (com modo demo)
js/admin.js       → painel e exportações
sql/schema.sql    → tabela dos jogos + regras de segurança  ← rodar 1 vez
assets/           → favicon (aba do navegador), apple-touch-icon e og-image (prévia ao compartilhar)
```

## Como rodar
Abra a pasta no VS Code → botão direito em `index.html` → **Open with Live Server**.
Sem Live Server também abre, mas use um servidor para testar o painel.

## Configurar o banco (Supabase) — passo a passo

1. **SQL Editor** → cole todo o `sql/schema.sql` → **Run**.
   - Antes, troque `seu.email@ifto.edu.br` (no topo do arquivo) pelo e-mail de quem poderá ver os inscritos.
   - Se já criou tabelas de versões anteriores (`inscricoes` e/ou `inscricoes_jogos`), apague-as antes
     (comandos no topo do SQL), pois as colunas mudaram. Exporte dados reais antes, se houver.
2. **Authentication → Users → Add user**: crie o usuário admin (mesmo e-mail do passo 1) com senha forte.
3. **Authentication → Providers → Email**: desative **"Allow new users to sign up"**
   (assim ninguém além de você cria conta).
4. Confira `SUPABASE_URL` e `SUPABASE_ANON_KEY` em `js/supabase.js`. A chave `anon/publishable` é pública
   por natureza — a proteção está nas regras do banco. **Nunca** coloque a `service_role` no site.

Pronto: o site grava, e **só você** lê pelo `admin.html` (ou pelo Table Editor do Supabase).

> Sem credenciais, o site entra em **modo demonstração** (dados só no navegador). Com credenciais
> preenchidas, se o Supabase não responder o site mostra erro — nunca finge que gravou.

## Acessar e exportar os inscritos

Abra `/admin.html`, entre com o e-mail/senha do passo 2 e use:
**Excel (.xlsx)**, **PDF** ou **CSV** (exportam o que está filtrado na tela).
Há busca (nome, matrícula, e-mail, telefone, faculdade), filtro por vínculo (IFTO/externo) e por jogo, e contadores no topo.

## Formulário (inscrição nos jogos)

Todos os botões "inscreva-se" do site levam a ele. Campos:
jogo (select) · nome · "é aluno do IFTO?" → **sim**: matrícula · **não**: faculdade + período · e-mail · telefone.
Não aceita a mesma pessoa duas vezes no mesmo jogo (por e-mail ou matrícula).

> O formulário de inscrição geral no evento foi removido.

## Segurança (o que foi feito)

- Banco: visitantes só **inserem**; leitura/exclusão só do admin (RLS). A política antiga que deixava
  qualquer um **ler todos os e-mails e telefones** foi removida.
- Validações também no banco (tamanhos, e-mail, telefone, matrícula/faculdade obrigatórias conforme o caso)
  e e-mail/matrícula únicos por jogo contra duplicatas.
- Anti-XSS: dados do usuário nunca entram como HTML; nome aceita só letras, espaço, `'`, `.` e `-`.
- Anti-spam: campo isca (honeypot) + limite de envios por navegador.
- Exportações protegidas contra "injeção de fórmula" (`=`, `+`, `-`, `@`) no Excel/CSV.
- CSP restringindo scripts/estilos/conexões, SDK do Supabase com versão fixada, links externos com `noopener`.
- `admin.html` com `noindex` (fora do Google).

Cabeçalhos HTTP de segurança (não dá para fazer por HTML) ficam no `netlify.toml`:
`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`
e `Permissions-Policy`. A Netlify já serve HTTPS.

## Antes de publicar — checklist

- [ ] Trocar a URL da imagem de compartilhamento por **endereço absoluto**: em `index.html`, `og:image` e
      `twitter:image` → `https://SEU-SITE/assets/og-image.png` (WhatsApp/Instagram exigem URL completa).
- [ ] Conferir **ano e dias da semana** na agenda (`js/script.js`): os rótulos "terça…sexta" para 21–24/11
      só valem em alguns anos; em 2026 21/11 cai em sábado.
- [ ] Trocar os nomes **de exemplo** da comissão e as respostas do FAQ pelos reais.
- [ ] Rodar `sql/schema.sql` e criar o usuário admin.

## Programação vinda do SUAP

A agenda é carregada do evento 1902 no SUAP pela função `netlify/functions/programacao.mjs`
(rota `/api/programacao`, com cache de 10 min). Ela autentica via OAuth2 *client credentials*.

- Na Netlify: **Site configuration → Environment variables** → crie `SUAP_CLIENT_ID` e `SUAP_CLIENT_SECRET`.
- Localmente: as mesmas variáveis no arquivo `.env` (já no `.gitignore`; **nunca** faça commit dele).
- Se a função falhar (ou no Live Server, que não roda funções), o site mostra a programação fixa de `js/script.js`.
- A API não traz palestrante nem local por atividade: o título é a descrição do SUAP e o local é o do evento.
- Teste do conversor: `node --test netlify/lib/`.

## Editar conteúdo
Programação reserva, jogos e FAQ: arrays no começo de `js/script.js`. Textos: `index.html`.
Se criar um jogo novo, inclua o nome também no `check (jogo in (...))` do SQL, no `<select id="gameJogo">` e no filtro do `admin.html`.
