
const airplanes = []; // {codigo, empresa, modelo, capacidade, rota}

const resultado = document.getElementById('resultadoBusca');
let codigoSelecionado = null;

async function loadListAirplanes() {

    try {
        const resp = await fetch('searchAirplane.php');
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

    let inicioContador = performance.now();

    let i = 0;

    for (i = 0; i < airplanes.length; i++) {
        if (airplanes[i].codigo === codigoBusca) {
            flag = 1;
            codigoSelecionado = airplanes[i].codigo;
            break;
        }
    }

    let tempoExecucao = performance.now() - inicioContador;

    console.log(`Tempo inicio: ${inicioContador}`);
    console.log(`Tempo: ${tempoExecucao}`);

    if (flag === 0) {
        resultado.hidden = true;
        alert("Aeroporto não encontrada, tente novamente...");
    }
    if (flag === 1) {
        viewSearchAirports(airplanes[i], tempoExecucao);
    }
})

function viewSearchAirports(airplane, tempoExecucao) {
    resultado.hidden = false;
    document.getElementById('r-codigo').textContent = `🆔 Código da aeronvae: ${airplane.codigo}`;
    document.getElementById('r-empresa').textContent = `🏢 Empresa responsável: ${airplane.empresa ?? '-'}`;
    document.getElementById('r-modelo').textContent = `✈️ Modelo da aeronave: ${airplane.modelo ?? '-'} `;
    document.getElementById('r-capacidade').textContent = `👥 Capacidade máxima: ${airplane.capacidade ?? '-'}`;
    document.getElementById('r-rota').textContent = `🧭 Rota da aeronave: ${airplane.rota ?? '-'}`;
    document.getElementById('tempo').textContent = `🧭 Tempo de execução: ${tempoExecucao.toFixed(2)} ms`;
}

const buttonDelete = document.getElementById('buttonDelete');
buttonDelete.addEventListener('click', async () => {

    try {
        if (codigoSelecionado != null) {
            const resp = await fetch("deleteAirplane.php", {
                method: "POST",
                body: JSON.stringify({ codigo: codigoSelecionado })
            });

            const result = await resp.json();
            if (result.success) {
                alert("Aeronavel deletada com sucesso!");
                resultado.hidden = true;
            }
            else {
                alert("Erro ao deletar: " + result.message);
            }
        }
    }
    catch (err) {
        console.log(err);
    }

})

