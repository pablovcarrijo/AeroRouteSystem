const compressButton = document.getElementById("compress");


compressButton.addEventListener("click", async (event) => {
    event.preventDefault();

    const data = await gerarTextoParaCompressao();

    const compressedText = compressWithHuffmanToText(data);

    downloadTextFile(compressedText, "dados_comprimidos_huffman.txt");
});


async function gerarTextoParaCompressao() {
    let sb = "";

    try {
        const resp = await fetch("/aeroroute/compressionManagement/airportData.php");
        const data = await resp.json();
        console.log(data);
        data.forEach(element => {
            sb += `${element.codigo};${element.nome};${element.latitude};${element.longitude}`;
            sb += "\n";
        });
    }
    catch (err) {
        console.log(err);
    }

    return sb;
}

function compressWithHuffmanToText(data) {
    const freqMap = buildFrequencyMap(data);
    const root = buildHuffmanTree(freqMap);
    const codeMap = {};
    buildCodeMap(root, "", codeMap);
    const encodedBits = encodeText(data, codeMap);

    let result = "";

    const symbolsCount = Object.keys(freqMap).length;
    result += symbolsCount + "\n";

    for (const ch in freqMap) {
        const codePoint = ch.codePointAt(0);
        const freq = freqMap[ch];
        result += codePoint + "\t" + freq + "\n";
    }

    result += "DATA\n";

    result += encodedBits + "\n";

    return result;
}

function buildFrequencyMap(text) {
    const freq = {};
    for (const ch of text) {
        if (!freq[ch]) {
            freq[ch] = 0;
        }
        freq[ch]++;
    }
    return freq;
}

class HuffmanNode {
    constructor(ch, freq, left = null, right = null) {
        this.ch = ch;
        this.freq = freq;
        this.left = left;
        this.right = right;
    }

    folha() {
        return !this.left && !this.right;
    }
}


function buildHuffmanTree(freqMap) {
    const nodes = [];

    for (const ch in freqMap) {
        nodes.push(new HuffmanNode(ch, freqMap[ch]));
    }

    while (nodes.length > 1) {
        nodes.sort((a, b) => a.freq - b.freq);

        const n1 = nodes.shift();
        const n2 = nodes.shift();

        const parent = new HuffmanNode(null, n1.freq + n2.freq, n1, n2);
        nodes.push(parent);
    }

    return nodes[0];
}


function buildCodeMap(node, path, codeMap) {
    if (!node) return;

    if (node.folha()) {
        codeMap[node.ch] = path;
    } else {
        buildCodeMap(node.left, path + "0", codeMap);
        buildCodeMap(node.right, path + "1", codeMap);
    }
}


function encodeText(text, codeMap) {
    let bits = "";
    for (const ch of text) {
        bits += codeMap[ch];
    }
    return bits;
}


function downloadTextFile(text, fileName) {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}
