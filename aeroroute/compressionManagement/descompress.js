
const decompressButton = document.getElementById("descompress");

const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.accept = ".txt";
fileInput.style.display = "none";

document.body.appendChild(fileInput);

decompressButton.addEventListener("click", (event) => {
    event.preventDefault();
    fileInput.click();
});

fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsText(file, "utf-8");
    reader.onload = async (e) => {
        const compressedText = e.target.result;
        
        const decompressedText = decompressFromText(compressedText);
        console.log("Texto descomprimido:", decompressedText);
        
        const airportsArray = parseDecompressedAirports(decompressedText);
        console.log("Objetos prontos:", airportsArray);
        
        try {
            const resp = await fetch("compressionManagement/saveDescompress.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(airportsArray)
            });
            
            const text = await resp.text();
            console.log("Resposta do servidor:", text);
            
            alert("Dados descomprimidos E salvos no banco com sucesso!");
            
        } catch (err) {
            console.error("Erro ao enviar dados ao PHP:", err);
            alert("Erro ao salvar no banco.");
        }
    };
    
});

function decompressFromText(compressedText) {
    const lines = compressedText.split(/\r?\n/);
    let index = 0;

    const symbolsCount = parseInt(lines[index++], 10);

    const freqMap = {};
    for (let i = 0; i < symbolsCount; i++, index++) {
        const line = lines[index].trim();
        if (!line) continue;

        const [cpStr, freqStr] = line.split("\t");
        const codePoint = parseInt(cpStr, 10);
        const freq = parseInt(freqStr, 10);

        const ch = String.fromCodePoint(codePoint);
        freqMap[ch] = freq;
    }

    if (lines[index].trim() === "DATA") {
        index++;
    } else {
        console.error("Formato inválido: não encontrou 'DATA'");
        return "";
    }

    let bits = "";
    for (; index < lines.length; index++) {
        bits += lines[index].trim();
    }

    const root = buildHuffmanTree(freqMap);

    const originalText = decodeBitsWithHuffman(bits, root);

    return originalText;
}

function decodeBitsWithHuffman(bits, root) {
    let result = "";
    let node = root;

    for (const bit of bits) {
        node = bit === "0" ? node.left : node.right;

        if (node.folha()) {
            result += node.ch;
            node = root;
        }
    }

    return result;
}

function parseDecompressedAirports(text) {
    const lines = text.trim().split("\n");
    const result = [];

    lines.forEach(line => {
        const [codigo, nome, latitude, longitude] = line.split(";");

        if (codigo && nome && latitude && longitude) {
            result.push({ codigo, nome, latitude, longitude });
        }
    });

    return result;
}
