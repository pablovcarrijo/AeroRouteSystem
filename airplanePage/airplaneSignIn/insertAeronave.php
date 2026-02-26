<?php
header('Content-Type: application/json');
require __DIR__ . '/../../db.php';

try {
    $codigoAeronave = $_POST["codigoAeronaveInput"];
    $empresaAviao = $_POST["empresaAviaoInput"];
    $modeloAviao = $_POST["modeloAviaoInput"];
    $capacidade = $_POST["capacidadeMaximaInput"];
    $rota = $_POST["rotaAeronave"];

    $sql = "INSERT INTO aeronave 
            (codigoAeronave, empresaResponsavel, modeloAviao, capacidadeMaxima, rotaAeronave)
            VALUES (?, ?, ?, ?, ?)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$codigoAeronave, $empresaAviao, $modeloAviao, $capacidade, $rota]);

    echo json_encode([
        'success' => true
    ]);
    exit;

} catch (PDOException $e) {

    if ($e->getCode() === '23000' && $e->errorInfo[1] == 1062) {
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'error' => 'DUPLICATE_CODE'
        ]);
        exit;
    }

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'SERVER_ERROR',
        'detail' => $e->getMessage()
    ]);
    exit;
}
