# Publicar o mockup em triadeerp.com.br (demo)

> **O que é isto:** colocar o mockup atual online como **vitrine/demonstração**.
> Não é o sistema real — não tem backend nem banco; cada visitante vê dados
> isolados no próprio navegador (localStorage). Serve para mostrar a interface.

Vamos usar o **Netlify** (gratuito, conecta no GitHub, atualiza sozinho a cada
`git push`, HTTPS automático). O DNS continua no **Registro.br** — assim o
e-mail do domínio, se houver, não é afetado.

---

## Passo 0 — Enviar a configuração para o GitHub

No `cmd`, na pasta do projeto:

```
cd %USERPROFILE%\Desktop\ERP_TRIADE
git add -A
git commit -m "Config de deploy do mockup (_redirects)"
git push
```

> O arquivo `_redirects` (na raiz) faz o endereço principal do site abrir o
> mockup direto, mesmo ele estando em `Info/mockups/`.

## Passo 1 — Criar a conta e o site no Netlify

1. Acesse https://app.netlify.com e entre com **"Sign up with GitHub"**.
2. **Add new site → Import an existing project → Deploy with GitHub**.
3. Autorize o Netlify e escolha o repositório **`triade-erp`**.
4. Na tela de configuração do build, **deixe tudo em branco**:
   - *Build command:* (vazio)
   - *Publish directory:* (vazio, ou `.`)
5. Clique **Deploy**. Em ~1 minuto o site fica no ar num endereço tipo
   `https://algum-nome-aleatorio.netlify.app` — **abra e confira o mockup**.

> Se quiser, em *Site configuration → Change site name* troque o nome aleatório
> por algo como `triade-erp`.

## Passo 2 — Ligar o domínio triadeerp.com.br

1. No Netlify: **Domain management → Add a domain** → digite `triadeerp.com.br`.
2. O Netlify vai mostrar **exatamente** quais registros DNS criar. Em geral:
   - **A** | nome `@` (ou raiz) | valor: o IP que o Netlify indicar
     *(costuma ser `75.2.60.5` — mas use o que aparecer na tela)*.
   - **CNAME** | nome `www` | valor: `seu-site.netlify.app`.
3. Entre no **Registro.br** (https://registro.br), faça login, vá em
   `triadeerp.com.br → DNS / Editar zona` e **adicione os registros acima**
   exatamente como o Netlify mandou.
4. Salve. A propagação leva de alguns minutos a algumas horas. O Netlify
   provisiona o **certificado HTTPS sozinho** depois que o DNS aponta certo.

Pronto: `https://triadeerp.com.br` abre o mockup.

---

## Manutenção (depois de no ar)

Cada vez que mexermos no mockup, basta:

```
git add -A
git commit -m "descricao da mudanca"
git push
```

O Netlify detecta o push e **republica o site automaticamente** em ~1 min.

## Observações

- É **demo**: não use para operar de verdade. Dados não são salvos no servidor.
- Quando partirmos para o sistema real (Fase 0 do `PLANO-DESENVOLVIMENTO.md`),
  a hospedagem muda (precisa de backend + PostgreSQL) — este guia é só do mockup.
- Alternativa ao Netlify: **Cloudflare Pages** (também grátis, lê o mesmo
  `_redirects`). Exige mover os *nameservers* para a Cloudflare — mais robusto,
  porém mexe em todo o DNS do domínio. Para uma demo, o Netlify é mais simples.
