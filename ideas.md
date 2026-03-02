# Ideias de Design — Social Media Calendar Pro

## Abordagem 1
<response>
<text>
**Design Movement:** Editorial Brutalism Funcional
**Core Principles:**
- Tipografia pesada como elemento estrutural
- Contraste extremo entre áreas de dados e espaços vazios
- Cor como linguagem de status, não decoração
- Densidade informacional máxima sem sacrificar legibilidade

**Color Philosophy:** Fundo quase-branco (#F7F6F2) com preto intenso (#1A1A1A) para texto. Acentos em amarelo-âmbar (#F5A623) para ações primárias e vermelho-coral (#E84545) para alertas. Cada cliente recebe uma cor de identidade que domina seu card.

**Layout Paradigm:** Grade assimétrica com coluna lateral fixa de clientes (220px) e área de calendário ocupando o restante. Dias da semana como colunas verticais densas. Sem arredondamentos excessivos — bordas retas ou levemente arredondadas (2px).

**Signature Elements:**
- Linha de cor grossa (4px) no topo de cada card de cliente como identificador visual
- Tipografia em caixa alta para rótulos de status
- Separadores horizontais em traço grosso

**Interaction Philosophy:** Cliques diretos, sem animações desnecessárias. Modal abre com deslize rápido (150ms). Etiquetas de status mudam com um clique — sem dropdowns.

**Animation:** Transições de 120-180ms com ease-out. Sem parallax ou efeitos de scroll. Foco em micro-interações de estado.

**Typography System:** Syne Bold (títulos/nomes de clientes) + Inter Regular (corpo/descrições). Hierarquia clara: 24px título, 14px corpo, 11px metadados.
</text>
<probability>0.07</probability>
</response>

## Abordagem 2
<response>
<text>
**Design Movement:** Dashboard Operacional Moderno — inspirado em ferramentas SaaS profissionais como Linear e Notion
**Core Principles:**
- Clareza operacional acima de tudo
- Identidade visual do cliente como elemento central de cada card
- Hierarquia visual que permite varredura rápida de muitos itens
- Interface que "some" para o conteúdo aparecer

**Color Philosophy:** Fundo cinza-azulado escuro (#0F1117) com cards em (#1C1F2E). Texto em branco suave (#E8EAF0). Acentos em índigo-elétrico (#6366F1). Cada cliente tem sua cor primária que aparece como borda lateral e fundo suave do avatar.

**Layout Paradigm:** Sidebar esquerda com lista de clientes + área principal com calendário em grade 7 colunas. Header fixo com navegação semanal. Cards de post compactos com avatar do cliente, tipo de post e status em uma linha.

**Signature Elements:**
- Avatar circular do cliente com borda colorida (cor da marca)
- Pill de status com cor semântica (verde=pronto, amarelo=produção, cinza=rascunho)
- Linha de tempo horizontal sutil no topo do calendário

**Interaction Philosophy:** Hover revela ações secundárias. Modal com backdrop blur. Drag-and-drop para reorganizar posts entre dias.

**Animation:** Framer Motion com spring physics. Cards entram com fade+slide-up (200ms). Modal com scale de 0.95→1.

**Typography System:** DM Sans (interface) + JetBrains Mono (links/códigos). Peso 500 para labels, 400 para corpo.
</text>
<probability>0.08</probability>
</response>

## Abordagem 3 ✅ ESCOLHIDA
<response>
<text>
**Design Movement:** Studio Criativo — mistura de organização profissional com a energia visual de uma agência de comunicação
**Core Principles:**
- Identidade visual do cliente como protagonista (cor, logo, tipografia própria)
- Calendário como quadro visual, não planilha
- Status como linguagem visual imediata (cor + ícone)
- Navegação fluida entre semanas sem perda de contexto

**Color Philosophy:** Fundo branco-quente (#FAFAF8) com sidebar em cinza-claro (#F2F1EE). Texto principal em grafite (#2D2D2D). Acentos em verde-esmeralda (#10B981) para "pronto", âmbar (#F59E0B) para "em produção", cinza (#9CA3AF) para "rascunho". Cada cliente traz sua própria paleta de cores que colore seus cards.

**Layout Paradigm:** Layout de três zonas: sidebar esquerda estreita (64px) com ícones de clientes para filtro rápido, área central com calendário semanal em grade, e painel direito que desliza para mostrar detalhes do post selecionado (em vez de modal flutuante).

**Signature Elements:**
- Miniatura colorida do cliente (logo + cor de fundo) como identificador em cada card
- Tag de tipo de post com ícone (Reels, Feed, Stories, Carrossel)
- Indicador de status como ponto colorido + texto

**Interaction Philosophy:** Clique no card abre painel lateral deslizante. Etiquetas de status editáveis inline com clique. Filtros por cliente e por status na barra superior.

**Animation:** Transições suaves de 200-250ms. Painel lateral desliza da direita. Cards com hover sutil (elevação de sombra). Entrada dos cards com stagger animation.

**Typography System:** Outfit (títulos e nomes de clientes, peso 600-700) + Inter (corpo e metadados, peso 400-500). Escala tipográfica: 20px seção, 15px card title, 12px metadata.
</text>
<probability>0.09</probability>
</response>

---

## Decisão Final: Abordagem 3 — Studio Criativo
Escolhida pela combinação de identidade visual forte por cliente, layout funcional de três zonas e linguagem visual imediata para status.
