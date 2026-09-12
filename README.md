# 🚗 Seven Drive — Gestão de Frota e Locação de Veículos (100% Gratuito / $0/mês)

Aplicação web completa, moderna e responsiva para gestão inteligente de frota, locações de veículos, vistorias obrigatórias por câmera, conciliação PIX, alertas duplos de manutenção preventiva por KM e controle de multas com transferência de pontuação (FICI).

---

## 🌟 Arquitetura e Stack Técnica ($0 de Custo Permanente)

- **Frontend**: Next.js 14 (App Router) + React 18 + Tailwind CSS + Lucide Icons.
- **Backend & Banco de Dados**: Supabase (Plano Free) — PostgreSQL, Row Level Security (RLS) e Supabase Storage.
- **Deploy**: Vercel ou Netlify (Integração contínua via repositório GitHub).
- **Notificações**: Alertas visuais simultâneos pulsantes (Atenção 1.000 km e Urgência 500 km) + Web Push Notifications nativo no navegador.

---

## 🚀 Como Configurar o Banco Supabase em 1 Minuto

1. Acesse o painel do [Supabase](https://supabase.com/dashboard) e crie um novo projeto gratuito (ex: `seven-drive`).
2. No menu lateral esquerdo, clique em **SQL Editor**.
3. Abra o arquivo [`supabase/migrations/20260912_initial_schema.sql`](./supabase/migrations/20260912_initial_schema.sql).
4. Cole todo o conteúdo no SQL Editor do Supabase e clique em **RUN**.
5. Todas as tabelas, funções de segurança (RLS), gatilhos e a rotina de purga de 60 dias serão criadas automaticamente.
6. Copie a `Project URL` e a `anon public key` em **Project Settings > API** e adicione ao seu arquivo `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
   ```

---

## 📱 Módulos e Funcionalidades

### 1. Portal do Locatário (Motorista) — Mobile-First
- **Wizard de Pagamento em 3 Etapas**:
  - **Etapa 1**: Exibição do valor do aluguel, geração de QR Code PIX dinâmico e botão "Copiar Chave PIX (Copia e Cola)".
  - **Etapa 2**: Upload do comprovante de pagamento bancário (PDF ou Foto).
  - **Etapa 3**: Vistoria Digital Obrigatória: Captura das 6 fotos do veículo (Frente, Lateral Esquerda, Lateral Direita, Traseira, Interior e Odômetro) + digitação da quilometragem atual.
- **Envio de Evidência de Manutenção**:
  - Envio de foto da nota fiscal das peças e foto do odômetro.
- **Histórico Completo**:
  - Consulta a todos os aluguéis pagos e comprovantes.

### 2. Portal do Locador (Administrador)
- **Fila de Dupla Conferência**:
  - Comparação lado a lado entre o comprovante de pagamento e as fotos da vistoria/odômetro.
  - Botão **"Confirmar e Dar Baixa"**: Atualiza o saldo real, grava o novo KM oficial do veículo no sistema e recalcula os alertas.
- **Gestão Total de Pagamentos**:
  - O administrador pode adicionar pagamentos manuais, editar datas/valores ou excluir registros com auditoria.
- **Linha do Tempo Semanal de Pagamentos (Timeline)**:
  - 🟢 **VERDE**: Semanas totalmente quitadas e confirmadas.
  - 🟡 **AMARELO**: Semana atual ou com vencimento próximo (1 a 2 dias).
  - 🔴 **VERMELHO**: Pagamento em atraso.
- **Saldo Líquido Real Consolidado**:
  - Cálculo automático por veículo: `Receitas (Aluguéis) - Despesas (Manutenções + Multas + Impostos/Taxas) = Saldo Líquido Real`.
- **Manutenção Preventiva & Alertas Duplos**:
  - Parametrização customizada por KM (ex: Óleo a cada 8.000 km, Pneus a cada 40.000 km).
  - Alerta piscante simultâneo na tela do locador e locatário ao atingir 1.000 km (Atenção) e 500 km (Urgência).
- **Gestão de Multas & Espelho FICI**:
  - Registro de infrações e geração de documento pré-preenchido do **Formulário de Identificação do Condutor Infrator (FICI)** nos termos do CTB Art. 257 para transferência de pontos na CNH.
- **Purga Automática de 60 Dias**:
  - Rotina de exclusão automática de comprovantes, vistorias e fotos antigas no Storage após 60 dias, mantendo fixos apenas CRLV e CNH.

---

## 💻 Execução Local

```bash
# Instalar dependências
npm install

# Rodar servidor de desenvolvimento
npm run dev

# Acessar aplicação
# Abra http://localhost:3000 no navegador
```
