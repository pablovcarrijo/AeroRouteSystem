
const airplanes = []; // {codigo, empresa, modelo, capacidade, rota}

const resultado = document.getElementById('resultadoBusca');

async function loadListAirplanes() {

    try {
        const resp = await fetch('searchScript.php');
        const data = await resp.json();
        console.log(data);
        data.forEach(element => {
            airplanes.push(element);
        });

        airplanes.forEach((element) => console.log(element));
    }
    catch (err) {
        console.log(err);
    }
}
loadListAirplanes();

const searchButton = document.getElementById("searchButton");
searchButton.addEventListener("click", (e) => {
    e.preventDefault();

    const codigoBuscaStr = document.getElementById('codigoBusca').value.trim();
    const codigoBusca = Number(codigoBuscaStr)

    let flag = 0;
    let inicio = 0;
    let fim = airplanes.length - 1;
    let meio;

    let inicioContador = performance.now();

    while (inicio <= fim) {
        meio = Math.floor((inicio + fim) / 2)
        if (airplanes[meio].codigo === codigoBusca) {
            flag = 1;
            break;
        }
        else if (airplanes[meio].codigo < codigoBusca) {
            inicio = meio + 1;
        }
        else if (airplanes[meio].codigo > codigoBusca) {
            fim = meio - 1;
        }
    }

    let tempoExecucao = performance.now() - inicioContador;

    console.log(`Tempo inicio: ${inicioContador}`);
    console.log(`Tempo: ${tempoExecucao}`);
    
    if (flag === 0) {
        resultado.hidden = true;
        alert("Aeronave não encontrada, tente novamente...");
    }

    if (flag === 1) {
        viewSearchAirplane(airplanes[meio], tempoExecucao);
    }

})

function viewSearchAirplane(airplane, tempoExecucao) {
    resultado.hidden = false;
    document.getElementById('r-codigo').textContent = `🆔 Código da aeronvae: ${airplane.codigo}`;
    document.getElementById('r-empresa').textContent = `🏢 Empresa responsável: ${airplane.empresa ?? '-'}`;
    document.getElementById('r-modelo').textContent = `✈️ Modelo da aeronave: ${airplane.modelo ?? '-'} `;
    document.getElementById('r-capacidade').textContent = `👥 Capacidade máxima: ${airplane.capacidade ?? '-'}`;
    document.getElementById('r-rota').textContent = `🧭 Rota da aeronave: ${airplane.rota ?? '-'}`;
    document.getElementById('tempo').textContent = `🧭 Tempo de execução: ${tempoExecucao.toFixed(2)} ms`;

}

