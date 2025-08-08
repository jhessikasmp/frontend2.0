# JS FinanceApp - Frontend

Frontend desenvolvido em React com Vite para o sistema de gestão financeira pessoal.

## 🚀 Tecnologias Utilizadas

- **React 18** - Biblioteca para interfaces de usuário
- **Vite** - Build tool e servidor de desenvolvimento
- **React Router Dom** - Roteamento
- **Tailwind CSS** - Framework CSS utilitário
- **Axios** - Cliente HTTP para chamadas à API
- **Lucide React** - Ícones
- **Headless UI** - Componentes acessíveis

## ✅ Funcionalidades Implementadas

### 🔐 Autenticação
- [x] Página de Login
- [x] Página de Registro
- [x] Contexto de autenticação com React Context
- [x] Proteção de rotas
- [x] Persistência de sessão no localStorage

### 🎨 Interface
- [x] Tema claro/escuro
- [x] Design responsivo completo
- [x] Componentes reutilizáveis
- [x] Navigation com hamburger menu mobile
- [x] Cards otimizados para mobile (25% menores)

### 💰 Gestão Financeira
- [x] Dashboard com resumo financeiro
- [x] Gerenciamento de salários
- [x] Sistema de despesas completo
- [x] Sistema de investimentos
- [x] Fundos individuais (Emergência, Viagem, Carro, Mesada)
- [x] Relatórios anuais
- [x] Transferências entre fundos e salário
- [x] Lembretes personalizados

### 🔧 Integrações
- [x] Configuração de API com interceptadores
- [x] Tratamento de erros
- [x] Validação de formulários
- [x] Variáveis de ambiente configuradas

## 📱 Navegação

### Desktop
- Navegação em abas horizontais
- Todas as seções visíveis simultaneamente

### Mobile  
- Menu hamburger responsivo
- Navegação dropdown otimizada

## 🏃‍♂️ Como executar

1. **Instalar dependências:**
```bash
npm install
```

2. **Iniciar o servidor de desenvolvimento:**
```bash
npm run dev
```

3. **Acessar:** http://localhost:3000 (ou porta alternativa mostrada no terminal)

## 📄 Scripts disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Visualiza o build de produção
- `npm run lint` - Executa o linter

## 📁 Estrutura do projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── FundPage.jsx    # Componente compartilhado para fundos
│   └── ProtectedRoute.jsx
├── context/            # Contextos React (autenticação, etc)
├── hooks/              # Hooks customizados (tema, etc)
├── pages/              # Páginas da aplicação
│   ├── Dashboard.jsx   # Dashboard principal
│   ├── Expenses.jsx    # Gestão de despesas
│   ├── Investments.jsx # Gestão de investimentos
│   ├── Reports.jsx     # Relatórios anuais
│   └── [Fundos].jsx   # Páginas individuais dos fundos
├── services/           # Serviços de API
├── App.jsx             # Componente principal
├── main.jsx           # Ponto de entrada
└── index.css          # Estilos globais
```

## 🔄 Status Atual

### ✅ Completamente Implementado
- Sistema de autenticação
- Dashboard responsivo
- Gestão de despesas
- Sistema de investimentos  
- Fundos individuais
- Relatórios anuais
- Navegação mobile/desktop
- Otimização mobile

### 🔗 Dependências do Backend
- API rodando em http://localhost:5000
- Endpoints funcionais para todas as funcionalidades

### 🐛 Troubleshooting

**Tela em branco?**
1. Verificar se o backend está rodando na porta 5000
2. Verificar console do navegador para erros
3. Tentar acessar http://localhost:3001/login diretamente
4. Limpar localStorage: `localStorage.clear()`

**Porta ocupada?**
- O Vite automaticamente usa uma porta alternativa (3001, 3002, etc.)

## 🎯 Funcionalidades em Destaque

- **Responsive Design**: Interface otimizada para todos os dispositivos
- **Mobile First**: Cards 25% menores em dispositivos móveis
- **Navegação Intuitiva**: Menu hamburger em mobile, abas em desktop
- **Gestão Completa**: Salários, despesas, investimentos e fundos
- **Relatórios**: Sistema completo de relatórios anuais
- **Transferências**: Sistema de transferência entre fundos e salário
# frontend2.0
