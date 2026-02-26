const airports = [];      // { id, name, lat, lng, radio, marker (do leaflet) }
const routes = [];         // { fromId, toId, weight, polyline }

const matrizAdj = [];
const idIndex = {};
const listAdj = [];  // {fromId: [{toId, weight}]}

let selectedAirportId = null;
let newId = 0;

const FIRST_RADIO = 1;
const SECOND_RADIO = 2;
const THIRD_RADIO = 3;
const FOURTH_RADIO = 4;

// LISTA DE ADJACÊNCIA
// Lista de adjacência - Para cara rota nova, adiciono na lista de adjacência
function adjacentList(element) {
    if (!listAdj[element.fromId]) listAdj[element.fromId] = [];
    if (!listAdj[element.toId]) listAdj[element.toId] = [];

    listAdj[element.fromId].push({ toId: element.toId, weight: element.weight });
    listAdj[element.toId].push({ toId: element.fromId, weight: element.weight });
}


// MATRIZ DE ADJACÊNCIA
function initializeMatriz() {
    const n = airports.length;

    for (let i = 0; i < n; i++) {
        matrizAdj[i] = [];
        for (let j = 0; j < n; j++) {
            matrizAdj[i][j] = 0;
        }
    }

    let index = 0;
    airports.forEach(e => {
        idIndex[e.id] = index;
        index++;
    })

    routes.forEach(element => {
        matrizAdj[idIndex[element.fromId]][idIndex[element.toId]] = element.weight;
        matrizAdj[idIndex[element.toId]][idIndex[element.fromId]] = element.weight;
    })
}

function addElementMatriz(element) {
    matrizAdj[idIndex[element.fromId]][idIndex[element.toId]] = element.weight;
    matrizAdj[idIndex[element.toId]][idIndex[element.fromId]] = element.weight;
}

function cresceMatrizAdjacent(newElement) {

    const newIndexElement = airports.length - 1;
    idIndex[newElement.id] = newIndexElement;

    for (let i = 0; i < newIndexElement; i++) {
        matrizAdj[i].push(0);
    }

    const n = airports.length;
    const newRow = new Array(n).fill(0);
    matrizAdj[newIndexElement] = newRow;

}

// Inicia mapa (centro  de monte carmelo)
const map = L.map('map', { doubleClickZoom: false }).setView([-18.725, -47.4989], 6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);



async function loadAirportsFromDB() {
    const resp = await fetch('listAirports.php');
    const dados = await resp.json();

    dados.forEach(a => {
        const marker = L.marker([a.lat, a.lng], { title: a.name })
            .addTo(map)
            .bindPopup(a.name);

        airports.push({
            id: a.id,
            name: a.name,
            lat: a.lat,
            lng: a.lng,
            radio: a.radio,
            marker
        });

        marker.on("click", () => {
            const airportClicked = airports.find(x => x.marker === marker);
            if (selectedAirportId === null) {
                selectedAirportId = airportClicked.id;
            } else if (selectedAirportId !== airportClicked.id) {
                const from = airports.find(x => x.id === selectedAirportId);
                const weight = euclidianaWeight([from.lat, from.lng], [airportClicked.lat, airportClicked.lng]);
                const poly = L.polyline([[from.lat, from.lng], [airportClicked.lat, airportClicked.lng]], { weight: 2 }).addTo(map);
                const route = { fromId: from.id, toId: airportClicked.id, weight, polyline: poly };
                routes.push(route);
                adjacentList(route);
                addElementMatriz(route);

                console.log(matrizAdj);
                console.log(listAdj);

                fetch('saveRoute.php', {
                    method: 'POST',
                    body: new URLSearchParams({
                        origemId: from.id,
                        destinoId: airportClicked.id,
                        distancia: weight
                    })
                }).then(r => r.text())
                    .then(t => console.log('saveRoute ->', t))
                    .catch(e => console.error(e));

                selectedAirportId = null;
            }
            renderAirpotsList();
        });
    });
    renderAirpotsList();
    await loadRoutesFromDB();
    initializeMatriz();
    console.log(matrizAdj);
    console.log(listAdj);
}
loadAirportsFromDB();

async function loadRoutesFromDB() {
    const resp = await fetch('loadRoutes.php');
    const dados = await resp.json();

    try {
        dados.forEach(element => {
            const fromAirport = airports.find(a => a.id == element.origemId);
            const toAirport = airports.find(a => a.id == element.destinoId);

            const line = L.polyline([[fromAirport.lat, fromAirport.lng], [toAirport.lat, toAirport.lng]], { weight: 2 }).addTo(map);

            const route = {
                fromId: fromAirport.id, toId: toAirport.id, weight: element.distancia, polyline: line
            }
            routes.push(route);
            adjacentList(route);
            console.log("Rotas carregadas");
        });
    }
    catch (err) {
        console.log(err);
    }
}

function renderAirpotsList() {
    const getHTML = document.getElementById('airportsList');
    getHTML.innerHTML = '<b>Lista de aeroportos:</b>';

    airports.forEach(airport => {
        const line = document.createElement('div');
        line.innerHTML = `${airport.id} - ${airport.name}`;
        line.style.cursor = 'pointer';
        line.style.marginBottom = '5px';
        line.style.padding = '5px';
        line.style.background = '#eeeeeeef';
        getHTML.appendChild(line);

        line.onclick = () => {
            map.setView([airport.lat, airport.lng], 7);
            line.style.background = '#c9c9c9ef';
            line.style.borderRadius = '4px';
            setTimeout(() => line.style.background = '#eeeeeeef', 500);

        }
    })
}

// Adicionar aeroporto ao clicar no mapa
map.on('dblclick', async (clicked) => {

    // Dá um id e um nome para o novo aeroporto
    const name = prompt("Nome do aeroporto:");
    if (name != null && name != "") {


        const resp = await fetch('routeMap.php', {
            method: 'POST',
            body: new URLSearchParams({
                name: name,
                lat: String(clicked.latlng.lat),
                lng: String(clicked.latlng.lng),
                radio: 0
            })
        });

        const text = await resp.text();
        console.log("Resposta do PHP:", text);

        if (!resp.ok) {
            alert("Erro ao salvar aeroporto");
            return;
        }

        let saved;
        try {
            saved = JSON.parse(text);
        } catch (e) {
            alert("PHP não retornou JSON.");
            console.error(text);
            return;
        }

        const marker = L.marker([saved.lat, saved.lng], { title: saved.name })
            .addTo(map)
            .bindPopup(saved.name);

        let newAirport = { id: saved.id, name: saved.name, lat: saved.lat, lng: saved.lng, radio: saved.radio, marker };
        airports.push(newAirport);
        cresceMatrizAdjacent(newAirport);

        marker.on('click', () => { // Quando clico em um marker (isso daqui é uma programação assincrona)
            const airportClicked = airports.find(x => x.marker === marker); // Busca ele na o array de aeroportos

            // Tem uma lógica de pegar o clicado anteriormente o  novo, para colocar o polyline
            if (selectedAirportId === null) {
                selectedAirportId = airportClicked.id; // Salva aquele clicado de começo
            }
            else if (selectedAirportId !== airportClicked.id) { // Na segunda vez que clicar, entra aqui
                const from = airports.find(x => x.id === selectedAirportId); // Pega o aeroporto anterior
                const weight = euclidianaWeight([from.lat, from.lng], [airportClicked.lat, airportClicked.lng]); // Calcula o peso com o aeroporto anterior e o de agr
                const poly = L.polyline([[from.lat, from.lng], [airportClicked.lat, airportClicked.lng]], { weight: 2 }).addTo(map); // Adiciono a linha polyline, com o from até o meu destino
                let route = { fromId: from.id, toId: airportClicked.id, weight, polyline: poly }; // Adiciona uma rota nova
                routes.push(route);
                adjacentList(route);
                addElementMatriz(route);

                console.log(matrizAdj);
                console.log(listAdj);

                fetch('saveRoute.php', {
                    method: 'POST',
                    body: new URLSearchParams({
                        origemId: from.id,
                        destinoId: airportClicked.id,
                        distancia: weight
                    })
                }).then(r => r.text())
                    .then(t => console.log('saveRoute ->', t))
                    .catch(e => console.error(e));

                selectedAirportId = null;
            }

            renderAirpotsList();

        });
        renderAirpotsList();
    }
});

// Distância Euclidiana - Peso das rotas
function euclidianaWeight(a, b) {
    const dx = a[0] - b[0];
    const dy = a[1] - b[1];
    return Math.sqrt(dx * dx + dy * dy);
}

async function clearAll() {
    airports.forEach(airport => airport.marker.remove());
    routes.forEach(route => route.polyline.remove());

    while (airports.length > 0) {
        airports.pop();
    }

    while (routes.length > 0){
        routes.pop();
    }

    fetch('reset.php');

    alert("Resetado com sucesso!");
}

// Um Welch um pouco modificado, pois não uso grafo planar
async function setarRadioFrequencia() {
    // De começo a gente tem 4 cores, mas por ser uma grafo nn planar pode aumentar
    const radios = [FIRST_RADIO, SECOND_RADIO, THIRD_RADIO, FOURTH_RADIO];

    // Crio um array com cada id dos aeroportos
    const vertices = airports.map(a => a.id);

    // Crio um Map, que guarda o id do aeroporto e seu grau no grafo, se ele for isolado
    // ele recebe 0 como grau
    const degree = new Map();
    for (const id of vertices) {
        degree.set(id, listAdj[id] ? listAdj[id].length : 0);
    }

    // Ordena os vértices, de acordo com o grau que tá no Map
    vertices.sort((a, b) => degree.get(b) - degree.get(a));

    // Crio um Map guardando o id do aeroporto com a rádio que ele vai ter,
    // mas todos os aeroportos começa com a rádio 0
    const radioMap = new Map();
    for (const id of vertices) {
        radioMap.set(id, 0)
    };

    // Ao invés de prosseguir com o algoritmo de Welch que começa verificando pelas cores,
    // vamos observar por cada vértice
    for (const verticeId of vertices) {
        // Pegamos os vizinhos daquele aeroporto pela lista de adjacência
        const vizinhos = listAdj[verticeId];

        // Identifica as radios que os vizinhos tem e adiciona no array de radios usadas
        const radiosUsadas = [];
        for (const vizinho of vizinhos) {
            const radio = radioMap.get(vizinho.toId);
            if (radio !== 0 && !radiosUsadas.includes(radio)) {
                radiosUsadas.push(radio);
            }
        }

        // Verifica se todas as rádios já estão sendo usadas pelos vizinhos,
        // se houver uma sobrando, ela passa a ser usada, não será 0 ainda
        let chosen = 0;
        for (const radio of radios) {
            if (!radiosUsadas.includes(radio)) {
                chosen = radio;
                break;
            }
        }

        // Se a variável chosen ainda for 0, quer dizer que preciso de uma nova rádio,
        // então chamo para criar uma nova rádio
        if (chosen === 0) {
            chosen = criaNovaRadio(radios);
        }

        // Mudo então a rádio daquele aeroporto de 0 para a nova rádio, mas em um caso
        // que dê errado (não tenho mínima ideia que caso que poderia ser) a rádio continua 0
        radioMap.set(verticeId, chosen);
    }

    // Apenas adiciono então a rádio de cada aeroporto no array airports
    for (const a of airports) {
        const r = radioMap.get(a.id);
        a.radio = r;
        // Quando clico no aeroporto o nome do aeroporto e embaixo a rádio dele
        const txt = `Rádio: ${r}`;
        a.marker.bindPopup(`${a.name}<br>${txt}`);
    }

    // Para cada elemento do Map radioMap, eu pego o id e o seu valor, a fim de realizar um
    // update no banco de dados
    for (const [id, radio] of radioMap) {
        const resp = await fetch('updateAirportsRadio.php', {
            method: 'POST',
            body: new URLSearchParams({ id: String(id), radio: String(radio) })
        });

        if (!resp.ok) {
            alert("Erro ao salvar radio");
        }
    }
    // Apenas para confirmar que deu certo
    alert("Rádios setadas com sucesso!")
    console.log(airports);
    console.log("radios usados:", radios);

}

// Função que cria uma nova rádio, caso não dê para colocar uma das já criada
function criaNovaRadio(radios) {
    // Apenas crio uma nova rádio do tamanho + 1 da quantidade de rádios
    const novo = radios.length + 1;
    // Adiciono então no array de radios, alterando o array original
    radios.push(novo);
    // Retorno a nova rádio criada, pois já posso usar ela
    return novo;
}

document.getElementById('clearAll').onclick = clearAll;
document.getElementById("setarRadio").onclick = setarRadioFrequencia;