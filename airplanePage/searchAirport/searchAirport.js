const airports = []; //idAeroporto, nome, latitude, longitude, radioFrequencia
let posicoesEncontradas = 0;
const resultadoPesquisa = [];

async function loadAirports() {

    try {
        const resp = await fetch('searchAirport.php');
        const data = await resp.json();
        console.log(data);
        data.forEach(element => {
            airports.push(element);
        });

        airports.forEach((element) => console.log(element));
    }
    catch (err) {
        console.log(err);
    }
}

function normalizaPesquisa(str) {
    return str.toUpperCase();
}

function charToCode(str, idx) {
    return str.charCodeAt(idx);
}


function rabinKarp(textoOriginal, subtextOriginal) {
    const texto = normalizaPesquisa(textoOriginal);
    const subtext = normalizaPesquisa(subtextOriginal);

    const n = texto.length;
    const m = subtext.length;

    const BASE = 256;
    const MOD = 997;

    let baseElevada = 1;
    for (let i = 1; i <= m - 1; i++) {
        baseElevada = (baseElevada * BASE) % MOD;
    }

    let hashDoSubtext = 0;
    let hashDaJanela = 0;
    for (let i = 0; i < m; i++) {
        hashDoSubtext = (hashDoSubtext * BASE + charToCode(subtext, i)) % MOD;
        hashDaJanela = (hashDaJanela * BASE + charToCode(texto, i)) % MOD;
    }

    for (let inicio = 0; inicio <= n - m; inicio++) {

        if (hashDaJanela === hashDoSubtext) {
            const trecho = texto.slice(inicio, inicio + m);
            if (trecho === subtext) {
                return 1;
            }
        }

        if (inicio < n - m) {
            const charQueSai = charToCode(texto, inicio);
            const charQueEntra = charToCode(texto, inicio + m);
            
            hashDaJanela = hashDaJanela - (charQueSai * baseElevada) % MOD;
            hashDaJanela = (hashDaJanela * BASE + charQueEntra) % MOD;
        }
    }

    return 0;
}

async function rabinKarpAirports(termo) {

    let achou = 0;

    for (const a of airports) {
        achou = rabinKarp(a.nome, termo);
        if (achou === 1) {
            resultadoPesquisa.push(a);
            console.log("pushed");
        }
    }
}

function mostrarResultados() {
    const painel = document.getElementById("resultadoBusca");
    const lista = document.getElementById("listaResultados");
    lista.innerHTML = '';

    if (!painel || !lista) {
        alert("Busca não encontrada");
    }

    painel.hidden = false;
    for (const a of resultadoPesquisa) {
        const li = document.createElement('li');
        li.textContent = `${a.idAeroporto} — ${a.nome} (lat: ${a.latitude}, lon: ${a.longitude}) - frequência de radio: 
                        ${a.radioFrequencia}`;
        lista.appendChild(li);
    }

}

document.addEventListener("DOMContentLoaded", async () => {
    await loadAirports();

    const form = document.getElementById("formBusca");
    const input = document.getElementById("codigoBusca");

    codigoBusca.addEventListener("input", (e) => {
        e.preventDefault();
        resultadoPesquisa.length = 0;
        const termo = input.value;
        rabinKarpAirports(termo);
        mostrarResultados();
    });
});

