# TRIADE como app Android/iOS — guia do Capacitor

O Capacitor empacota o **mesmo** frontend React (o build em `apps/web/dist`)
dentro de um app nativo. Nada do código da aplicação muda: o app embarca o
HTML/JS e chama a API remota (Render) via `VITE_API_URL`. Isso permite publicar
na **Play Store** e na **App Store** e usar recursos nativos (ex.: leitura de
código de barras pela câmera).

Os arquivos de configuração já estão no repo:
- `apps/web/capacitor.config.ts` — appId `br.com.triadeerp.app`, nome "Tríade ERP", `webDir: dist`.
- Scripts em `apps/web/package.json`: `cap:sync`, `cap:android`, `cap:ios`.

---

## 1. Pré-requisitos

**Android (Windows, Linux ou macOS):**
- Node 18+ (já usado no projeto).
- [Android Studio](https://developer.android.com/studio) (instala o SDK + JDK).

**iOS (só em macOS):**
- Xcode (App Store) + Command Line Tools.
- CocoaPods: `sudo gem install cocoapods`.

> iOS **exige macOS** para compilar/publicar. No Windows dá pra fazer todo o
> Android; o iOS precisa de um Mac (ou um serviço de build em nuvem).

---

## 2. Instalar o Capacitor (uma vez)

Na **raiz do repo**:

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android -w @triade/web
# Para iOS (em macOS), adicione também:
npm install @capacitor/ios -w @triade/web
```

Isso grava as versões certas no `apps/web/package.json`.

---

## 3. Gerar os projetos nativos (uma vez)

```bash
cd apps/web
npm run build              # gera o dist (com a API de produção embutida)
npx cap add android
npx cap add ios            # só em macOS
```

Isso cria as pastas `apps/web/android/` e `apps/web/ios/` (os projetos nativos).

> **.gitignore:** versione `android/` e `ios/` (são os projetos), mas ignore os
> artefatos de build: `apps/web/android/app/build/`, `apps/web/android/.gradle/`,
> `apps/web/ios/App/Pods/`, `apps/web/ios/App/build/`, `*.apk`, `*.aab`, `*.ipa`.

---

## 4. Ciclo de trabalho (toda vez que mudar o app)

```bash
cd apps/web
npm run cap:sync           # = build + cap sync (copia o dist novo p/ os nativos)
npm run cap:android        # abre no Android Studio  →  Run ▶ no emulador/celular
npm run cap:ios            # abre no Xcode (macOS)    →  Run ▶ no simulador/iPhone
```

No Android Studio / Xcode é só apertar **Run** para rodar num emulador ou num
aparelho conectado por USB (com modo desenvolvedor ligado).

---

## 5. Publicar nas lojas (release)

**Android (Play Store):**
1. No Android Studio: *Build → Generate Signed Bundle / APK → Android App Bundle*.
2. Crie uma **keystore** (guarde com cuidado — é a identidade do app) e gere o `.aab`.
3. Suba o `.aab` no [Google Play Console](https://play.google.com/console) (conta de dev, taxa única de US$ 25).

**iOS (App Store):**
1. Conta no [Apple Developer Program](https://developer.apple.com) (US$ 99/ano).
2. No Xcode: configure o *Signing & Capabilities* (time de desenvolvimento).
3. *Product → Archive* → distribua via **TestFlight** (testes) ou App Store.

---

## 6. Próximo passo: leitura de código de barras nativa

O fluxo de estoque/separação do TRIADE é por **bipagem**. Hoje, no navegador,
depende de leitor USB/digitação. No app dá pra usar a **câmera nativa**:

```bash
npm install @capacitor-mlkit/barcode-scanning -w @triade/web
cd apps/web && npm run cap:sync
```

Depois, nas telas de bipagem (Entrada, Recebimento, Separação, Inventário),
um botão "Escanear" chama o leitor nativo e injeta o código no mesmo campo que
já recebe a digitação. Permissão de câmera precisa ser declarada:
- Android: `android.permission.CAMERA` no `AndroidManifest.xml`.
- iOS: `NSCameraUsageDescription` no `Info.plist`.

> Posso implementar essa integração quando você quiser — é aditiva e usa o
> mesmo handler de código que já existe.

---

## 7. Atenção: CORS quando apertar a segurança

O app roda numa origem tipo `https://localhost` / `capacitor://localhost`.
Hoje a API está com `CORS_ORIGIN=*`, então funciona. Se você restringir o CORS
da API (Render) para a URL do site, **inclua também** as origens do Capacitor,
senão o app leva 401/erro de CORS:

```
CORS_ORIGIN=https://triade-erp.pages.dev,https://triadeerp.com.br,capacitor://localhost,https://localhost
```

---

## Alternativa (mais simples, menos recomendada)

Se quiser só um "atalho" do site publicado dentro de um app (sem embarcar o
build, sempre na última versão do ar), edite `apps/web/capacitor.config.ts` e
descomente a linha `server.url`. É instantâneo de atualizar, mas **a Apple
costuma recusar** apps que são só um wrapper do site, e não funciona offline.
O modo bundled (padrão) é o recomendado.
