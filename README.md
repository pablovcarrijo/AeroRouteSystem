# ✈️ AeroRoute System

O **AeroRoute System** é um projeto web para simular e gerenciar uma malha aérea, com cadastro de aeroportos/aeronaves, criação de rotas em mapa e aplicação de algoritmos de grafos para análise de caminhos.

## 💡 Ideia do projeto

A proposta é tratar aeroportos e rotas como um **grafo não direcionado**:

- **Vértices**: aeroportos.
- **Arestas**: rotas entre aeroportos.
- **Peso da aresta**: distância euclidiana entre as coordenadas de dois aeroportos.

Com isso, o sistema permite:

- Montar a malha aérea visualmente em mapa.
- Calcular caminhos com **DFS**, **BFS**, **Dijkstra** e **Bellman-Ford**.
- Gerar uma **árvore geradora mínima (Prim)** no “Modo turista”.
- Definir frequência de rádio por aeroporto com uma estratégia baseada em coloração de grafo (Welsh-Powell adaptado).
- Comprimir/descomprimir dados de aeroportos com **Huffman**.

---

## 🚀 Funcionalidades principais

### 1) 🏠 Página inicial
A home (`aeroroute/index.html`) centraliza o acesso para:

- Controle de aeronaves
- Malha aérea
- Compressão de dados
- Descompressão de dados

### 2) 🛫 Controle de aeronaves
No módulo `aeroroute/airplanePage` é possível:

- **Cadastrar aeronaves** (código, empresa, modelo, capacidade e rota escolhida).
- **Buscar aeronaves** cadastradas.
- **Buscar aeroportos** cadastrados.
- **Deletar aeronaves** por código.
- Usar o **Modo turista** (visualização da árvore geradora mínima).

No cadastro, o sistema calcula e mostra rotas entre origem e destino com:

- DFS
- BFS
- Bellman-Ford
- Dijkstra

O usuário escolhe uma rota e ela é salva junto à aeronave.

### 3) 🗺️ Malha aérea (mapa)
No módulo `aeroroute/routeMap`:

- Duplo clique no mapa cria um novo aeroporto.
- Clique em dois aeroportos cria uma rota entre eles.
- Rotas e aeroportos são persistidos no banco.
- Botão de reset limpa aeroportos, rotas e aeronaves.
- Botão “Frequência de rádio” executa coloração para atribuir rádios sem conflito local.

### 4) 🧩 Compressão e descompressão
No módulo `aeroroute/compressionManagement`:

- Exporta dados de aeroportos para texto e comprime usando **codificação de Huffman**.
- Permite importar um arquivo `.txt` comprimido, descomprimir e salvar aeroportos no banco.

---

## ⚙️ Como foi feito o Back-end

O back-end foi desenvolvido em **PHP procedural** com **PDO** para acesso ao MySQL.

### 🗄️ Estrutura de acesso ao banco
- `aeroroute/db.php` cria a conexão PDO (host, database, usuário e senha).

### 🔌 Endpoints por domínio
- **Malha aérea** (`aeroroute/routeMap/*.php`):
  - listar aeroportos
  - salvar aeroporto
  - salvar rota
  - carregar rotas
  - atualizar rádio
  - reset geral
- **Aeronaves** (`aeroroute/airplanePage/**/**/*.php`):
  - inserir aeronave
  - listar rotas/aeroportos para formulários
  - consultar aeronaves
  - deletar aeronave
- **Compressão** (`aeroroute/compressionManagement/*.php`):
  - exportar dados de aeroportos/aeronaves
  - salvar dados descomprimidos

### 🔁 Padrão de comunicação
- Front-end usa `fetch` para chamar os scripts PHP.
- APIs retornam principalmente JSON (ou texto simples em alguns pontos legados).

---

## 🎨 Como foi feito o Front-end

O front-end usa **HTML + CSS + JavaScript puro** (sem framework SPA).

### 🧱 Organização
- Cada funcionalidade tem sua própria pasta com HTML/CSS/JS/PHP.
- O JavaScript concentra:
  - chamadas assíncronas (`fetch`)
  - lógica de algoritmos
  - renderização dinâmica das rotas/opções

### 🧭 Mapa interativo
- A visualização geográfica usa **Leaflet** com tiles do OpenStreetMap.
- Aeroportos são marcadores; rotas são polylines.

### 🖥️ Layout/UI
- Interfaces usam **Bootstrap 5** para grid, botões e formulários.
- CSS customizado complementa o estilo visual.

---

## 🛠️ Tecnologias e linguagens utilizadas

- **HTML5**
- **CSS3**
- **JavaScript (ES6+)**
- **PHP**
- **MySQL**
- **PDO** (acesso a dados)
- **Leaflet** (mapas)
- **Bootstrap 5** (interface)

---

## 📁 Estrutura de pastas (resumo)

```text
AeroRouteSystem/
├── README.md
└── aeroroute/
    ├── index.html
    ├── indexStyle.css
    ├── db.php
    ├── routeMap/
    ├── airplanePage/
    │   ├── airplaneSignIn/
    │   ├── searchAirplane/
    │   ├── searchAirport/
    │   ├── deleteAirplane/
    │   └── minTree/
    └── compressionManagement/
```

---

## 🧠 Algoritmos implementados

- **DFS (Depth-First Search)**: busca um caminho por profundidade.
- **BFS (Breadth-First Search)**: busca em largura e reconstrói caminho por pais.
- **Dijkstra**: menor custo acumulado para pesos não negativos.
- **Bellman-Ford**: cálculo de menor caminho por relaxamento de arestas.
- **Prim**: árvore geradora mínima para o “Modo turista”.
- **Huffman**: compressão de texto baseada em frequência de caracteres.

---

## 🗃️ Banco de dados (visão geral)

Pelos scripts, as tabelas principais são:

- `aeroporto` (id, nome, latitude, longitude, radioFrequencia)
- `rotas` (idRota, origemId, destinoId, distancia)
- `aeronave` (codigoAeronave, empresaResponsavel, modeloAviao, capacidadeMaxima, rotaAeronave)

> Observação: os nomes exatos de colunas/constraints devem seguir seu schema MySQL local.

---

## ▶️ Como executar o projeto

### ✅ Pré-requisitos

- PHP 8+
- MySQL/MariaDB
- Servidor web local (Apache, Nginx+PHP-FPM ou servidor embutido do PHP)

### 📌 Passo a passo

1. Clone o repositório.
2. Crie o banco `aeroroutesystem` no MySQL.
3. Crie as tabelas (`aeroporto`, `rotas`, `aeronave`) de acordo com os campos usados nos scripts.
4. Ajuste credenciais em `aeroroute/db.php` se necessário.
5. Sirva a pasta `aeroroute/` em um servidor PHP.
6. Abra `index.html` no contexto do servidor (ex.: `http://localhost/aeroroute/index.html`).

---

## 📚 Pontos de aprendizado / arquitetura

Este projeto demonstra na prática:

- Modelagem de problema real com **estruturas de grafos**.
- Integração **front-end + back-end** sem framework pesado.
- Uso de **mapa interativo** para entrada visual de dados.
- Persistência de dados relacionais e manipulação assíncrona com `fetch`.
- Aplicação de algoritmos clássicos em cenário de transporte aéreo.

---
