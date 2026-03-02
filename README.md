# Social Media Calendar Pro 📅✨

> Uma plataforma SaaS completa de gestão inteligente de calendário editorial para agências e criadores de conteúdo.

![Screenshot da Aplicação](https://via.placeholder.com/1200x630.png?text=Social+Media+Calendar+Pro)

## 📌 Sobre o Projeto

O **Social Media Calendar Pro** é um sistema SaaS fechado (Proprietário) desenvolvido para solucionar problemas de fluxo em agências focadas em mídias sociais e social media managers. 

A aplicação apresenta uma interface baseada no princípio "Desktop First", unindo usabilidade fluída com efeitos modernos como **Glassmorphism**, transições em overlay translúcido e gestão assíncrona robusta. O controle engloba fluxos de clientes (workspaces), agendamento semanal e acompanhamento de status ponta a ponta (Rascunho, Produção, Pronto, Publicado).

> ⚠️ **Nota Legal de Propriedade:**
> Este repositório está configurado como público exclusivamente para demonstração de portfólio. **O código fonte é proprietário e não é open-source.** Nenhuma licença está sendo concedida para uso comercial, reprodução, distribuição ou criação de trabalhos derivados destas linhas de código, componentes ou lógicas visuais, sem a autorização prévia e expressa do criador. Todos os direitos reservados.

---

## 🚀 Principais Features

- **🛡️ Autenticação Premium:** Login e Segurança com Supabase Auth integrados à base de dados postgres (Prisma).
- **📱 Interface Rica (UI/UX):** Efeito Glassmorphism nos modais e interceptadores (Rotas Transparentes do Next.js), barra de progresso nativa no topo (TopLoader) e design totalmente responsivo com suporte a Dark Mode.
- **🗓️ Visão Semanal Inteligente:** Navegação simplificada dia-a-dia pela semana, identificando o período atual de maneira rápida.
- **📊 Filtro de Métricas:** Sistema de filtragem e badges contabilizados em tempo real apontando o volume de postagens por "Status".
- **🏢 Múltiplos Workspaces (Agências):** Cada usuário possui escopo gerencial isolado sob a base de perfis e agência, preparados para sistemas e hierarquias de Assinatura/Planos. 

---

## 🛠️ Tech Stack & Arquitetura

Este SaaS moderno foi construído sob uma pilha escalável de altíssimo desempenho:

1. **[Next.js 15 (App Router)](https://nextjs.org)**: Core Framework em React.js SSR e Server Actions.
2. **[TypeScript](https://www.typescriptlang.org/)**: Tipagem estática robusta ponta-a-ponta (Typesafe).
3. **[Tailwind CSS](https://tailwindcss.com)**: Framework utilitário de estilização que habilita o Dark mode e os efeitos de refração de Backdrops (transparência vítrea).
4. **[Prisma ORM](https://www.prisma.io/)**: Mapeador objeto-relacional (ORM) para lidar com o Banco de Dados.
5. **[Supabase](https://supabase.com/)**: Backend-as-a-Service gerenciando o Postgres core e Auth System com extrema facilidade de scale.
6. **[Lucide React](https://lucide.dev/)**: Hand-crafted SVG icons.
7. **[shadcn/ui](https://ui.shadcn.com/)** & **Sonner**: Componentes React encapsulados, acessíveis e Toasters belíssimos.

---

## 📂 Estrutura Principal

A planta do projeto segue o App Router e preza por simplicidade + segurança do server:
```bash
src/
├── app/              # Estruturas Centrais do App Router (Root, Login, etc)
│   ├── actions/      # Lógicas seguras e estritas do Servidor (SSO)
│   ├── api/          # Middlewares pontuais para rotas REST caso seja necessário
├── components/       # Interface Universal (.UI) e Modais baseados em Context
├── contexts/         # Provider raiz controlando os estados locais
└── lib/              # Inicializadores Prisma, tipagens globais e Utils
```

---

## 💻 Para o Desenvolvedor Responsável

Se o senhor possui autorização de contribuição/pull local, o ambiente requer `.env.local`:

1. Instale as dependências com NPM:
   ```bash
   npm install
   ```
2. Crie ou importe suas chaves `.env.local` ligadas ao provedor Supabase (Database_url, Direct_url, e chaves de api JWT) na raíz do projeto.
3. Garanta a conexão com o Postgres:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
4. Rode a máquina de desenvolvimento com Next:
   ```bash
   npm run dev
   ```

---
*Feito com 💡 por **Gabriel Batista**. Verificação de Portfólio válida a partir de 2026.*
