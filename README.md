# RH System 

Sistema web para gestão de desempenho e carreira corporativa. O projeto centraliza cadastro de colaboradores, avaliações de desempenho, medidas disciplinares e histórico de cargos.
CRUD basicäo, nada de outro mundo. Usa POST, GET, PUT, PATCH e DELETE. 

## 🛠 Tech Stack

**Back-end**
* **Runtime:** Node.js
* **Linguagem:** TypeScript
* **Framework:** Express.js
* **Database:** PostgreSQL (via Supabase)
* **Driver:** pg (node-postgres)
* **Autenticação:** JWT (JSON Web Token)
* **Segurança:** bcryptjs

**Front-end**
So usa react/tailwind e essas baboseiras quem nao se garante no CSS puro
* HTML5, CSS3 e JavaScript
* Fetch API para consumo de dados

## ⚙️ Funcionalidades

O sistema atende às seguintes User Stories feitas na cadeira de Engenharia de Requisitos:

* **[US001]** Login (Autenticação JWT)
* **[US002]** Medidas Disciplinares (Advertências/Suspensões)
* **[US003]** Avaliação de Desempenho (Cálculo automático de média)
* **[US004]** Demissão (Soft Delete)
* **[US005]** Promoção e Gestão de Carreira
* **[US013]** CRUD de Funcionários
* **[Dashboard]** Analytics com gráficos e indicadores de turnover

## 🗄️ Banco de Dados

Banco de dados MEGA simples, mas escolhi usar PostgreSQL com cloud da Supabase.

* `usuarios` (com auto-relacionamento para hierarquia)
* `avaliacoes` e `itens_avaliacao` (relacionamento 1:N)
* `historico_carreira`
* `medidas_disciplinares`
* `empresa`

> **Nota:** Operações críticas como Avaliações e Alterações de Cargo utilizam Transactions (ACID) para garantir integridade.
> **Nota:** Sei que o nome e horrivel e feio, mas nao sou criativo o suficiente pra pensar num nome legal pra projeto sobre RH.
> **Nota:** O projeto era pra ser realizado em grupo, mas acabei fazendo "sozinho" hehe
 
