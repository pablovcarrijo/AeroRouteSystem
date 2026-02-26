const routes = [] // {fromId, toId, weight, polyline} 
const airports = [] // {id, name, lat, lng, radio}

const listAdj = []; // {fromId: [{toId, weight}, {toId, weight}...]}

// Lista de adjacência
function adjacentList(element) {
  if (!listAdj[element.fromId]) listAdj[element.fromId] = [];
  if (!listAdj[element.toId]) listAdj[element.toId] = [];

  listAdj[element.fromId].push({ toId: element.toId, weight: element.weight });
  listAdj[element.toId].push({ toId: element.fromId, weight: element.weight });

}

// Carrego todas os dados de rotas que temos no banco de dados e armazenamos no array routes
async function loadRoutesFromDb() {

  const resp = await fetch('listRoutes.php');
  const dados = await resp.json();

  try {
    dados.forEach(element => {
      const route = {
        fromId: element.origemId, toId: element.destinoId, weight: element.distancia
      }
      routes.push(route);
      adjacentList(route);
    })
  }
  catch (err) {
    console.log(err);
  }
}

// Carrego todos os dados dos aeroportos do banco de dados e salvo no array airports
async function loadAiportsFromDb() {

  const resp = await fetch('listAirports.php');
  const dados = await resp.json();

  try {
    dados.forEach(element => {
      const airport = {
        id: element.id, name: element.name, lat: element.lat, lng: element.lng,
        radio: element.radio
      }
      airports.push(airport);
    })
  }
  catch (err) {
    console.log(err);
  }
}

// Função do algoritmo de Prim para árvore geradora mínima
function prim(startId) {

  startId = Number(startId);

  const verticesArvore = new Set(); // Vértice dos nós já visitados
  // Dois arrays, um salva o vértice de origem e destino e o outro array salva o vértice de origem e o peso até ele
  const vertices = []; // [{toId: fromId}]
  const pesos = []; // [{toId: weight}]

  //De início, para chegar ao vértice de partida é peso 0 e ele não vem de nenhum outro vértice
  pesos[startId] = 0;
  vertices[startId] = null;

  const caminhoCreated = [];

  while (true) {
    // Inicialmente, precisamos olhar o vértice com o menor peso, que vamos armazenar em temp
    let temp = null;
    // Usamos a variável min apenas para pegar o vértice com o menor peso
    let min = Infinity;

    // Como o array de pesos tenho o destino e o custo para chegar nesse destino, eu busco o MENOR caminho até o momento
    for (const e in pesos) {
      const value = Number(e);
      // Caso ainda o nosso vértice ainda não tenha sido visitado e o seu peso é menor que o menor encontrado até o momento
      // atualizamos então o menor encontrado até o momento e salvamos esse vértice na variável temp
      if (!verticesArvore.has(value) && pesos[value] < min) {
        min = pesos[value];
        temp = value;
      }
    }

    // Quer dizer que todos os pontos foram observados
    if (temp == null) break;

    // Como em temp temos o MENOR peso, podemos salvar ele em um Set, pois não vamos observar ele novamente e
    // a estrutura Set permite o acesso mais rápido ao seu valor
    verticesArvore.add(temp);

    // Agora que avançamos para o próximo vértice com o menor peso, observamos os vizinhos do vértice selecionado
    const neighbors = listAdj[temp] || [];
    for (const { toId, weight } of neighbors) {
      const toIdNumber = Number(toId);
      const weightNumber = Number(weight);

      // Salvamos os vértices vizinhos e seus pesos nos arrays e caso já exista um caminho para o vértice, porém
      // achamos um caminho menor, atualizamos esse caminho
      if (!verticesArvore.has(toIdNumber) && (vertices[toIdNumber] === undefined || pesos[toIdNumber] > weightNumber)) {
        pesos[toIdNumber] = weightNumber;
        vertices[toIdNumber] = temp
      }
    }
  }

  // Construimos então nossa árvore, salvando no array "caminhoCreated" um objeto
  // que armazena o aeroporto de origem, o aeroporto de destino e o peso até chegar nele
  for (const e in vertices) {
    const value = Number(e);
    if (vertices[value] !== null) {
      caminhoCreated.push({ fromId: vertices[value], toId: value, weight: pesos[value] });
    }
  }
  return caminhoCreated;
}


let map;
let drawnLayer;

async function minTree() {
  // Sempre que clicarmos no botão, vamos reiniciar tudo, a fim de evitar mapas sobrepostos
  routes.length = 0;
  airports.length = 0;
  listAdj.length = 0;

  // Carregamos todas as informações de rotas e aeroportos do nosso banco de dados e salvamos no array routes e airports
  await loadRoutesFromDb();
  await loadAiportsFromDb();

  // Pegamos o id do aeroporto digitado pelo usuário
  const origemAirport = Number(document.getElementById("aeroportoSaida").value);

  // Se não existir o aeroporto na lista de adjacência, então ele não tem rotas ou não existe...
  if (!listAdj[origemAirport]) {
    alert("Erro, aeroporto inexistente ou sem conexão alguma");
    return;
  }

  // Cria o nosso mapa com o leaftlet
  if (!map) {
    map = L.map("map", { doubleClickZoom: false }).setView([-18.725, -47.4989], 6);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
  }

  // Criamos um novo mapa na tela, caso já existia um mapa, removemos ele e criamos um novo
  if (drawnLayer) drawnLayer.remove();
  drawnLayer = L.layerGroup().addTo(map);

  // Carrego todos os aeroportos em um Map, armazenando o id dele como chave e o sua informações como valor
  const airportById = new Map();
  for (const a of airports) airportById.set(Number(a.id), a);

  // Criamos a nossa árvore geradora mínima
  const arvoreGeradoraMinima = prim(origemAirport);
  console.log("Árvore:", arvoreGeradoraMinima);

  // desenha arestas + markers de todos os vértices usados
  for (const e of arvoreGeradoraMinima) {
    const a = airportById.get(Number(e.fromId));
    const b = airportById.get(Number(e.toId));
    if (!a || !b) continue;

    // Pegamos as coordenadas dos aeroportos, aeroporto a é salvo em p1 e aeroporto b é salvo em p2
    const p1 = [Number(a.lat), Number(a.lng)];
    const p2 = [Number(b.lat), Number(b.lng)];

    // Adicionamos a linha no nosso mapa, usando as coordenadas de p1 e p2
    L.polyline([p1, p2], { weight: 3, opacity: 0.8 }).addTo(drawnLayer);


    // Adicionamos então o marcador do aeroporto A no mapa, mostrando o seu id e o seu nome quando ele for clicado
    L.marker(p1).addTo(drawnLayer).bindPopup(`<b>${a.id}</b> - ${a.name}`);

    // Adicionamos então o marcador B no mapa, também mostrando o seu id e o seu nome quando for clicado
    L.marker(p2).addTo(drawnLayer).bindPopup(`<b>${b.id}</b> - ${b.name}`);

  }

  // Apenas para fazer um balãozinho no aeroporto de origem quando for tudo carregado
  const origemObj = airportById.get(origemAirport);
  // Cria um marcador por cima, e adiciona esse balãozinho e já mostra com o .openPopup()
  L.marker([Number(origemObj.lat), Number(origemObj.lng)], { title: "Origem" })
    .addTo(drawnLayer)
    .bindPopup(`<b>Origem:</b> ${origemObj.id} - ${origemObj.name}`)
    .openPopup();

}