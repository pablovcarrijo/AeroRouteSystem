<?php
require __DIR__ . "/../db.php";

$json = file_get_contents("php://input");
$data = json_decode($json, true);

if ($data === null) {
    echo "erro: json inválido";
    exit;
}

try {
    $sql = $pdo->prepare("
        INSERT INTO aeroporto (idAeroporto, nome, latitude, longitude)
        VALUES (:codigo, :nome, :latitude, :longitude)
    ");

    foreach ($data as $airports) {
        $sql->execute([
            ":codigo" => $airports["codigo"],
            ":nome" => $airports["nome"],
            ":latitude" => $airports["latitude"],
            ":longitude" => $airports["longitude"]
        ]);
    }

    echo "ok";

} catch (Exception $e) {
    echo "erro: " . $e->getMessage();
}
