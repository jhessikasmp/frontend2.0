# Deploy JSFinance (Backend no Render, Frontend no Vercel)

## Backend (Render)

1. **Crie uma conta no [Render](https://render.com/)**
2. **Suba o projeto para o GitHub**
   - Certifique-se que o backend está em um repositório separado ou em uma pasta `backend/`.
   - Não suba o arquivo `.env` (já está no `.gitignore`).
3. **No painel do Render, clique em 'New Web Service'**
   - Escolha o repositório do backend.
   - Configure:
     - **Environment**: Node
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Root Directory**: `backend` (se estiver em monorepo)
   - Adicione as variáveis de ambiente (copie do `.env`, mas nunca suba credenciais para o GitHub):
     - `NODE_ENV=production`
     - `PORT=10000` (Render define automaticamente, mas pode deixar)
     - `MONGODB_URI=...` (sua string do MongoDB Atlas)
     - `CLIENT_URL=https://seu-frontend.vercel.app`
   - Clique em 'Create Web Service'.
4. **Aguarde o build e o deploy**
   - O Render mostrará logs e a URL pública do backend.
5. **Teste a API**
   - Acesse `https://seu-backend.onrender.com/api/health` para verificar se está funcionando.

---

## Frontend (Vercel)

1. **Crie uma conta no [Vercel](https://vercel.com/)**
2. **Suba o projeto para o GitHub**
   - Certifique-se que o frontend está em um repositório separado ou em uma pasta `frontend/`.
   - Não suba o arquivo `.env` (já está no `.gitignore`).
3. **No painel do Vercel, clique em 'Add New Project'**
   - Escolha o repositório do frontend.
   - Configure:
     - **Framework Preset**: Vite
     - **Build Command**: `vite build` (ou deixe padrão)
     - **Output Directory**: `dist`
     - **Root Directory**: `frontend` (se estiver em monorepo)
   - Adicione a variável de ambiente:
     - `VITE_API_URL=https://seu-backend.onrender.com/api`
   - Clique em 'Deploy'.
4. **Aguarde o build e o deploy**
   - O Vercel mostrará logs e a URL pública do frontend.
5. **Teste o site**
   - Acesse `https://seu-frontend.vercel.app` para verificar se está funcionando.

---

## Dicas Finais
- Sempre configure variáveis de ambiente pelo painel das plataformas, nunca suba `.env` para o GitHub.
- Se precisar de CORS, ajuste o backend para aceitar o domínio do frontend.
- Atualize o `README.md` e `DEPLOY.md` com instruções para outros desenvolvedores.
- Para atualizações, basta dar push no GitHub que ambos serviços redeployam automaticamente.
