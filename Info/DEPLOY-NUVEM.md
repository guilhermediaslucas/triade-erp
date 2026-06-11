# Deploy na nuvem — TRIADE ERP

Guia passo a passo para colocar o sistema no ar. Combinação usada (tudo tem
plano gratuito para começar):

- **Banco de dados:** Neon (PostgreSQL) — você já usa.
- **API (servidor):** Render.
- **Site (frontend):** Netlify.

Arquitetura: o **site** chama `/api/...`; o Netlify **encaminha** essas chamadas
para a **API** no Render; a API fala com o **banco** no Neon.

> Pré-requisito: o código já está no GitHub (`guilhermediaslucas/triade-erp`).
> Sempre que você fizer `git push`, o Render e o Netlify reconstroem sozinhos.

---

## Parte 1 — Banco de dados (Neon)

1. Entre no painel do Neon e abra o seu projeto.
2. Recomendado: crie um **banco separado para produção** (ou um "branch" de
   produção), para não misturar com testes.
3. Copie a **connection string** (algo como
   `postgresql://usuario:senha@host/banco?sslmode=require`). Guarde — é o
   `DB_URL` que a API vai usar.

---

## Parte 2 — API no Render

1. Crie uma conta em https://render.com (pode logar com o GitHub).
2. **New +** → **Web Service** → conecte o repositório `triade-erp`.
3. Preencha:
   - **Name:** `triade-api` (ou o que quiser).
   - **Root Directory:** deixe **em branco** (é um monorepo; o install roda na raiz).
   - **Runtime / Language:** Node.
   - **Build Command:** `npm install`
   - **Start Command:** `npm run start:prod -w @triade/api`
   - **Health Check Path:** `/health`
4. Em **Environment** (variáveis de ambiente), adicione:
   - `DB_URL` = a connection string do Neon (Parte 1).
   - `DB_SSL` = `true`
   - `JWT_SECRET` = um valor **longo e aleatório** (40+ caracteres). Pode gerar
     num gerador de senhas. **Guarde em segredo** — é o que protege os logins.
   - `NODE_ENV` = `production`
   - `CORS_ORIGIN` = `*` (por enquanto; depois dá para restringir ao site).
5. Clique em **Create Web Service**. Aguarde o deploy (alguns minutos).
6. Quando terminar, o Render mostra a **URL da API** (ex.:
   `https://triade-api.onrender.com`). **Copie essa URL.**
7. Teste: abra `https://SUA-API.onrender.com/health` no navegador — deve
   responder `{"status":"ok","db":"conectado"}`.

> ⚠️ No plano gratuito do Render, a API "hiberna" após um tempo sem uso; a
> primeira chamada depois disso demora ~30s para acordar. Para uso sério,
> um plano pago barato mantém ela sempre ligada.

---

## Parte 3 — Preparar o banco (uma vez)

As tabelas e o primeiro usuário não se criam sozinhos. Faça **uma vez**:

1. No seu computador, na pasta do projeto, edite o arquivo `.env` e coloque
   **temporariamente** o `DB_URL` de produção (Neon) e um `JWT_SECRET`.
2. Rode:
   ```
   cd %USERPROFILE%\Desktop\ERP_TRIADE
   db-setup.bat
   ```
   Isso cria as tabelas (migrations) e o seed inicial: empresa demo `belle`,
   usuário `admin@belle.com.br`, senha `admin123`.
3. (Opcional, recomendado) Volte o `.env` para a configuração de
   desenvolvimento depois.

Esse usuário admin da `belle` já tem permissão de **super-admin**. Você vai usar
ele para criar a empresa real (Parte 5).

---

## Parte 4 — Site no Netlify

1. Crie uma conta em https://netlify.com (pode logar com o GitHub).
2. **Add new site** → **Import an existing project** → conecte o `triade-erp`.
3. Configure o build:
   - **Base directory:** deixe **em branco**.
   - **Build command:** `npm install && npm run build -w @triade/web`
   - **Publish directory:** `apps/web/dist`
4. **Antes de publicar**, é preciso dizer ao site onde está a API. No seu
   computador, edite o arquivo `apps/web/public/_redirects` e troque
   `SUA-API.onrender.com` pela URL real da API (Parte 2, passo 6). Salve,
   depois `git add -A`, `git commit` e `git push`.
5. No Netlify, clique em **Deploy**. Quando terminar, ele mostra a URL do site
   (ex.: `https://triade-erp.netlify.app`). Abra e faça login com
   `belle` / `admin@belle.com.br` / `admin123`.

> Se aparecer "erro de rede" ao logar, quase sempre é o `_redirects` com a URL
> da API errada. Confira o passo 4.

---

## Parte 5 — Primeiro uso (empresa real)

1. Logado como o admin da `belle` (que é super-admin), vá em
   **Super-admin › Empresas** e **provisione a empresa real** (cria o tenant,
   o perfil Administrador e o primeiro usuário dela).
2. Saia e entre de novo com a empresa e o usuário recém-criados.
3. Crie os **perfis e permissões** dos demais usuários.
4. Cadastre os dados iniciais: produtos, categorias, marcas, clientes,
   fornecedores, vendedores, tabela de preços.
5. **Troque a senha** do admin e considere desativar/remover a empresa demo
   `belle` quando não precisar mais dela.

---

## Depois (opcional, recomendado)

- **Apertar a segurança do CORS:** no Render, troque `CORS_ORIGIN` de `*` para
  a URL do site (ex.: `https://triade-erp.netlify.app`).
- **Domínio próprio:** tanto Netlify quanto Render permitem ligar um domínio
  (ex.: `erp.suaclinica.com.br`) com HTTPS automático.
- **Backups:** o Neon mantém histórico/branches; configure conforme a
  criticidade dos dados.
- **Manter a API acordada:** plano pago do Render (ou um "ping" periódico).

## Fora do MVP (fase futura)

Emissão fiscal real (NF-e) e cobrança real (boleto/Pix integrados) **não** estão
no sistema — eram a Fase 7 do plano. Hoje o financeiro é controle interno.
Se a operação exigir nota fiscal, é um projeto à parte (integração com um
emissor / API fiscal).
