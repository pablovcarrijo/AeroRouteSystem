//Um dicionário dos aeroportos, chave = id do aeroporto  valor = dados do banco de dados
const airportsById = {};

// Grafo de rotas: { idOrigem: [ { to, weight }, {to, weight}... ] }
// VOU FAZER POR LISTA DE ADJACÊNCIA
let grafo = {};
// Uma flag só pra dizer se foi possível carregar as rotas ou não do banco de dados
let routesLoaded;
let selectedPath;
const form = document.querySelector("form");

let dfsRoute;
let bfsRoute;
let dijkstraRes;
let bellmanRes;

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const selectedOption = document.querySelector('input[name="routeOption"]:checked');

  let selectedPath;

  if (selectedOption.value === "DFS") selectedPath = dfsRoute;
  if (selectedOption.value === "BFS") selectedPath = bfsRoute;
  if (selectedOption.value === "Dijkstra") selectedPath = dijkstraRes.path;
  if (selectedOption.value === "BellmanFord") selectedPath = bellmanRes.path;

  const formData = new FormData(form);
  formData.append("rotaAeronave", JSON.stringify(selectedPath));

  const res = await fetch("insertAeronave.php", {
    method: "POST",
    body: formData
  });

  const data = await res.json();

  if (!res.ok) {
    if (data.error === "DUPLICATE_CODE") {
      alert("Já existe uma aeronave com esse código!");
    } else {
      alert("Erro ao cadastrar aeronave.");
    }
    return;
  }

  alert("Aeronave cadastrada com sucesso!");
  form.reset();
  document.getElementById("selectedRouteInput").value = "";
  document.getElementById("rotasContainer").style.display = "none";
  document.getElementById("rotasContainer").style.display = "none";
});


// Carrega aeroportos e preenche <select> de origem/destino
async function loadListAirposts() {
  const resp = await fetch("listAirposts.php");
  const data = await resp.json(); // Carrega lista de aeroportos do banco de dados

  const selectOrigem = document.getElementById("origem");
  const selectDestino = document.getElementById("destino");

  // Para cada aeroporto, salvo no airportsById e adiciono uma option no HTML para o <select>
  data.forEach(a => {
    airportsById[a.id] = a;

    const optionOrigem = document.createElement("option");
    optionOrigem.value = a.id;
    optionOrigem.textContent = a.name;
    selectOrigem.appendChild(optionOrigem);

    const optionDestino = document.createElement("option");
    optionDestino.value = a.id;
    optionDestino.textContent = a.name;
    selectDestino.appendChild(optionDestino);
  });
}

// Carrega as rotas do servidor e monta o grafo em memória
async function loadRoutes() {

  const resp = await fetch("listRoutes.php");
  const data = await resp.json(); // Carrego minhas informações do banco de dados

  constroiGrafo(data); // Chamo a função para construit minha lista de adjacência
  routesLoaded = true;
}

// Constrói lista de adjacência
// Meus routes estão no estilo:  [{idRota:w oridemId:x, destinoId:y, distancia:z}, ...] no banco de dados
// Mas vou usar apenas origemId, destinoId e distancia
function constroiGrafo(routes) {
  //grafoTemp = {origemId: [destinoId, distancia]}
  grafo = {};

  // Cada rota então vai receber seu ponto de origem, ponto de partida e seu peso, lembrando que é um grafo não direcional
  // ou seja, se tenho a ida também tenho a volta
  routes.forEach(element => {
    const from = String(element.origemId);
    const to = String(element.destinoId);
    const weight = Number(element.distancia);

    if (!grafo[from]) grafo[from] = []; // Se ainda não houver nó com rota, inicializa com vazia
    if (!grafo[to]) grafo[to] = [];

    grafo[from].push({ to: to, weight: weight }); // Vou adicionando rotas que partem daquele ponto, ficando: { idOrigem: [ { to, weight }, {to, weight}... ] }
    grafo[to].push({ to: from, weight: weight });
  });

}

//DFS (busca em profundidade)
//Testar Set depois, pq é tabela hash e pode ser que melhore a eficiência do programa
function dfsAlgoritmo(grafo, origem, destino) {
  // Temos um array de visitados
  const visited = [];
  // Temos um array para salvar o caminho
  const path = [];

  // A função recursiva do DFS
  function dfs(current) {
    // Adicionamos o nó atual como visitado e colocamos ele no array de caminho
    visited.push(current);
    path.push(current);

    // Achamos o nosso caminho, então encerramos a recursividade
    if (current === destino) return true;

    // toda a lógica do dfs, percorre cara destino de cada aeroporto
    // Aqui entramos na recursividade, onde para cara possível destino daquele nó, verificamos se aquele destino já foi visitado
    // se não foi visitado ainda, realizamos a recursão e vamos mais a fundo nele, até encontrar o nó que queremos
    // ou então voltamos para procurar nos outros caminhos, caso encontre será retornado um true e o programa é encerrado
    for (const e of grafo[current]) {
      if (!visited.includes(e.to)) {
        if (dfs(e.to)) return true;
      }
    }

    // Caso não seja encontrado um próximo nó que não foi visitado ou que existe, apagamos aquele nó do caminho e voltamos o nó
    path.pop();
    return false;
  }

  return dfs(origem) ? path : null; // Foi encontrado o nó destino? então retornamos o array do caminho, se não retornamos null
}

//BFS (busca em largura)
function bfsAlgoritmo(grafo, origem, destino) {
  // Onde vou armazenar temporariamente os possíveis caminhos daquele nó, mas tenho que começar pelo meu ponto de partida
  const queue = [];
  queue.push(origem);
  // Para marcar os nós visitados
  const visited = [];
  visited.push(origem);
  // Um map, para guardar como histórico, ex: x: y -> para chegar no x, passa pelo y
  const parent = {};

  while (queue.length > 0) { // Só acaba quando achar um caminho ou quando não achar um caminho
    // tira o primeiro valor a esquerda de queue, e em seguida armazena em current
    const current = queue.shift();
    if (current === destino) break; // Achou o caminho

    for (const e of grafo[current]) {
      if (!visited.includes(e.to)) {
        visited.push(e.to);
        parent[e.to] = current; // Guardo então que para chegar em e.to eu parto do nó current
        queue.push(e.to); // Adiciono todos os caminhos daquele nó no queue, para rodar dnv no while
      }
    }
  }

  if (!visited.includes(destino)) {
    return null; // sem caminho
  }

  // reconstrói caminho
  const path = []; // Vou armazenar aqui o meu caminho final
  let temp = destino; // Preciso então partir do meu destino, pois do meu destino até o meu inicio tem apenas um caminho construido
  // já não tenho o caminho partindo do inicio, pois do inicio montei vários caminhos
  while (temp !== undefined) {
    path.push(temp); // Armazeno então de trás pra frente o caminho, começando com o destino
    temp = parent[temp]; // Pego então o nó anterior de chegar ao temp
  }
  path.reverse(); // Faço um reverse, para ter o caminho do inicio ao fim, não do fim ao inicio
  return path; // Retorno então o caminho feito
}

//Dijkstra (menor custo total) 
// Só lembrar o algoritmo que a professora passou, do mesmo jeito
function dijkstraAlgoritmo(grafo, origem, destino) {
  // Um map, que guarda a distância conhecida da origem até o x -> dist[x]: origem, sendo x um valor, não um nó
  const dist = {};
  // Guarda os nós anteriores, para reconstrução do caminho no final
  const prev = {};
  // Nós que já foi fechou o custo mínimo para chegar neles
  const visited = [];

  // inicializa distâncias
  for (const x in grafo) {
    dist[x] = Infinity; // De início coloco um custo infinito para chegar a um nó
  }
  dist[origem] = 0; // Mas no meu ponto de partida coloco 0, já que estou partindo daquele local

  // Uma função auxiliar para a função principal do Dijkstra
  // Busca pegar o menor caminho até o momento do dist[x], tirando aqueles que já foram visitados
  function extractMin() {
    let minNode = null; //Guarda o id do melhor nó encontrado no momento
    let minDist = Infinity; // Guarda a menor distância encontrada no momento, iniciando com Infinity
    // O primeiro passo de todos é da origem, onde não está em visitados e entra na condição, então o primeiro retorno é o da origem
    for (const x in dist) {
      if (!visited.includes(x) && dist[x] < minDist) {
        minDist = dist[x];
        minNode = x;
      }
    }
    return minNode;
  }

  // A função principal do dijsktra
  // Faz todo o loop
  while (true) {
    const min = extractMin();
    if (min === null) break; // Caso não haja caminho, pq todos os nós vão ter sido vistados e Infinity < Infinity é falso, então minNode será null e finaliza o while
    if (min === destino) break;

    //Armazena o nó em visitados, já que agora vamos fechar ele
    visited.push(min);

    // Aqui pegamos todos os caminhos que aquele nó pode passar, e caso um caminho partindo dele para outro destino seja menor do que o já calculado para aquele
    // destino, substituimos esse valor
    for (const x of grafo[min]) {
      const temp = dist[min] + x.weight; // Faz o calculo da nova distância para aquele nó destino
      if (temp < dist[x.to]) { // Caso a distância seja menor, o valor atual é substituido pelo novo calculado, se não permanece igual
        dist[x.to] = temp; // Alteramos então o novo valor do caminho
        prev[x.to] = min; // Guardamos o id de destino e de origem dos aeroportos desse novo caminho
      }
    }
    // Volta então para o loop, pegando o menor para fazer todo o processo novamente
  }

  // Condição para quando não há caminhos que parte de origem até destino, pode ser nós isolados ou subgrafos não conectados
  if (dist[destino] === Infinity) {
    return { path: null, cost: Infinity };
  }

  // reconstrói caminho
  const path = [];
  let cur = destino;
  // Fazemos então o caminho de trás pra frente novamente, a maneira mais fácil
  while (cur !== undefined) {
    path.push(cur);
    cur = prev[cur];
  }
  path.reverse(); // Invertemos esse caminho, para ficar origem -> destino e não destino -> origem

  return { path, cost: dist[destino] };
}

function bellmanFordAlgoritmo(grafo, origem, destino) {
  const dist = {};
  const prev = {};
  let trocou = true;

  // Inicializa distâncias
  for (const v in grafo) {
    dist[v] = Infinity;
  }

  dist[origem] = 0;

  // Relaxa |V| - 1 vezes
  for (let i = 0; i < Object.keys(grafo).length - 1 && trocou; i++) {
    trocou = false;

    // Percorre todas as arestas
    for (const from in grafo) {
      for (const edge of grafo[from]) {

        // Só relaxa se o nó de origem já foi alcançado
        if (dist[from] + edge.weight < dist[edge.to]) {
          dist[edge.to] = dist[from] + edge.weight;
          prev[edge.to] = from;
          trocou = true;
        }
      }
    }
  }

  // Reconstrução do caminho
  const path = [];
  let cur = destino;

  while (cur !== undefined) {
    path.push(cur);
    cur = prev[cur];
  }

  path.reverse();

  return { path, cost: dist[destino] };
}

//Renderização das rotas na tela 
function renderRoutes(dfsRoute, bfsRoute, dijkstraResult, bellmanResult) {
  const dfsHTML = document.getElementById("routesDFS");
  const bfsHTML = document.getElementById("routesBFS");
  const dijkstraHTML = document.getElementById("routesDijkstra");
  const bellmanHTML = document.getElementById("routeBellman")

  rotasContainer.style.display = "none";

  dfsHTML.innerHTML = "";
  bfsHTML.innerHTML = "";
  dijkstraHTML.innerHTML = "";
  bellmanHTML.innerHTML = "";


  // Uma formatação que vai pegar todos os elementos do array que eu passar e vai colocar em uma string formatada, depois é só mostrar
  function formatRoute(route) {
    if (!route) return "Sem rota";

    let str = "";

    route.forEach((id, index) => {
      const aeroporto = airportsById[String(id)];


      str += aeroporto.name;

      if (index < route.length - 1) {
        str += " → ";
      }
    });

    return str;
  }

  // Configuração para mostrar a rota por DFS
  if (dfsRoute) {
    dfsHTML.style.marginBottom = "10px";

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "routeOption";
    radio.value = "DFS";

    const label = document.createElement("label");
    label.style.marginLeft = "5px";
    label.textContent = "Rota 1: " + formatRoute(dfsRoute);

    dfsHTML.appendChild(radio);
    dfsHTML.appendChild(label);
  }

  // Configuração para mostrar a rota por BFS
  if (bfsRoute) {
    bfsHTML.style.marginBottom = "10px";

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "routeOption";
    radio.value = "BFS";

    const label = document.createElement("label");
    label.style.marginLeft = "5px";
    label.textContent = "Rota 2: " + formatRoute(bfsRoute);

    bfsHTML.appendChild(radio);
    bfsHTML.appendChild(label);
  }

  // Configuração para mostrar a rota por Bellman-Ford e o peso total percorrido
  if (bellmanResult && bellmanResult.path) {
    bellmanHTML.style.marginBottom = "10px";

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "routeOption";
    radio.value = "BellmanFord";

    const label = document.createElement("label");
    label.style.marginLeft = "5px";
    label.textContent =
      "Rota 3: " +
      formatRoute(bellmanResult.path) +
      " | Distância da viagem: " +
      bellmanResult.cost;

    bellmanHTML.appendChild(radio);
    bellmanHTML.appendChild(label);
  }

  // Configuração para mostrar a rota por Dijkstra e o peso total percorrido
  if (dijkstraResult && dijkstraResult.path) {
    dijkstraHTML.style.marginBottom = "10px";

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "routeOption";
    radio.value = "Dijkstra";

    const label = document.createElement("label");
    label.style.marginLeft = "5px";
    label.textContent =
      "Rota 4: " +
      formatRoute(dijkstraResult.path) +
      " | Distância de viagem: " +
      dijkstraResult.cost;

    dijkstraHTML.appendChild(radio);
    dijkstraHTML.appendChild(label);

  }

}

//Atualiza rotas quando origem/destino mudam 
async function updateRoutes() {
  const origemSelect = document.getElementById("origem").value;
  const destinoSelect = document.getElementById("destino").value;

  const selectedRouteInput = document.getElementById("selectedRouteInput");
  selectedRouteInput.value = "";

  if (!routesLoaded) {
    await loadRoutes();
  }

  // Chama as funções algoritmicas para calcular as rotas BFS, DFS e Dijkstra
  dfsRoute = dfsAlgoritmo(grafo, origemSelect, destinoSelect);
  bfsRoute = bfsAlgoritmo(grafo, origemSelect, destinoSelect);
  dijkstraRes = dijkstraAlgoritmo(grafo, origemSelect, destinoSelect);
  bellmanRes = bellmanFordAlgoritmo(grafo, origemSelect, destinoSelect);


  // Apenas mostra as rotas
  renderRoutes(dfsRoute, bfsRoute, dijkstraRes, bellmanRes);
  // Torna meu display visível no HTML, pois antes ele estava como None
  rotasContainer.style.display = "flex";
}

// Inicialização
async function init() {
  await loadListAirposts();

  const origemSelect = document.getElementById("origem");
  const destinoSelect = document.getElementById("destino");

  origemSelect.addEventListener("change", updateRoutes);
  destinoSelect.addEventListener("change", updateRoutes);
}

// Ordem de chamada das funções: init() -> updateRoutes() -> loadRoutes() -> constroiGrafo() -> bfsAlgoritmo() -> dfsAlgoritmo() -> dijstraAlgoritmo() -> renderRoutes()
init();
