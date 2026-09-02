# SASPI Code — IFTO Palmas (versão simples)

Clone do site da Semana Acadêmica de Sistemas para Internet (SASPI Code) do IFTO Campus Palmas,
reconstruído em **HTML + CSS + JavaScript puro** — sem Vite, sem TypeScript, sem build, sem
dependências para instalar.

## Estrutura

```
saspi-code-simples/
├── index.html      → toda a estrutura da página (header, hero, agenda, games, etc.)
├── css/
│   └── style.css   → todo o estilo visual (cores, tipografia, layout responsivo)
└── js/
    └── script.js   → interatividade: menu mobile, abas de dias, modal de sessão,
                       botão "participar" dos jogos e as notificações (toasts)
```

## Como rodar

Não precisa instalar nada (`npm install`, etc). Basta abrir com o **Live Server** do VS Code:

1. Instale a extensão **Live Server** no VS Code (se ainda não tiver).
2. Abra a pasta `saspi-code-simples` no VS Code.
3. Clique com o botão direito em `index.html` → **"Open with Live Server"**.
4. O site abre automaticamente no navegador em algo como `http://127.0.0.1:5500`.

Você também pode simplesmente abrir o `index.html` direto no navegador (funciona sem
servidor, já que não há chamadas de API nem módulos ES importados por caminho relativo
que exijam `http://`).

## O que foi mantido do site original

- Mesmas seções: topo com aviso de inscrições, header com menu, hero, manifesto,
  "três lentes" (tracks), programação (agenda por dia), jogos, sobre o evento, rodapé.
- Mesma programação (dias 21 a 24/11) e os mesmos jogos.
- Mesmo esquema de cores (verde/vermelho institucional do IFTO) e tipografia
  (Space Grotesk, Manrope, DM Mono via Google Fonts).
- Mesmo comportamento: trocar de dia na agenda, abrir detalhes da atividade em modal,
  "participar" dos jogos, notificações (toast) ao clicar em botões, menu mobile.

## Seções novas (deixando o site mais institucional/acadêmico)

- **Comissão organizadora** (`#comissao`) — cartões com nome e função de quem organiza
  o evento (nomes fictícios de exemplo — troque pelos nomes reais da sua comissão).
- **Rede de apoio** — selo com as instituições que participam da programação
  (reaproveita as afiliações já citadas nos palestrantes da agenda).
- **Como chegar** (`#local`) — endereço oficial do IFTO Campus Palmas, telefone,
  e-mail e um mapa incorporado do Google Maps.
- **Perguntas frequentes** (`#faq`) — accordion com as dúvidas mais comuns
  (inscrição, certificado, gravações, etc.).

> O endereço usado em "Como chegar" é o endereço público oficial do IFTO Campus Palmas.
> Os nomes da comissão organizadora e as respostas do FAQ são **exemplos** — edite-os
> com as informações reais do seu evento antes de publicar.

## Acessibilidade

- **Link "Pular para o conteúdo"** — aparece ao pressionar Tab logo ao abrir a página,
  permitindo pular o menu e ir direto ao conteúdo principal.
- **Foco visível reforçado** em cartões, botões, abas da agenda e perguntas do FAQ,
  para quem navega só pelo teclado.
- **Modal de atividade acessível**: ao abrir, o foco vai para o botão de fechar; `Tab`
  fica preso dentro do modal (focus trap); `Esc` fecha; ao fechar, o foco volta para
  o botão que abriu o modal.
- **Accordion do FAQ** segue o padrão de acessibilidade `aria-expanded` /
  `aria-controls`, então também funciona bem com leitor de tela.
- **Mapa** com `title` descritivo e `loading="lazy"`.

## O que foi simplificado

- Sem React, sem Vite, sem TypeScript, sem Tailwind — tudo em HTML semântico e CSS puro.
- Ícones em um único sprite SVG dentro do próprio `index.html` (sem depender de pacote
  `lucide-react` nem de CDN de ícones).
- Toasts e modal implementados manualmente em ~250 linhas de JavaScript, sem bibliotecas.
- A imagem de fundo do hero (que no original vinha de um storage privado do projeto) foi
  trocada por um gradiente/textura em CSS, para o site funcionar 100% offline.

## Editar conteúdo

- **Programação**: edite o objeto `schedule` em `js/script.js`.
- **Jogos**: edite o array `games` em `js/script.js`.
- **Textos das seções**: edite diretamente em `index.html`.
- **Cores/estilos**: edite `css/style.css` (as cores principais estão em uso direto,
  ex.: `#2f7d46` verde IFTO e `#b52a36` vermelho de destaque).
