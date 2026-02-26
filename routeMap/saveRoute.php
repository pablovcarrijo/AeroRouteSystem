<?php

    require __DIR__ . '/../db.php';

    $origemId = $_POST['origemId'];
    $destinoId = $_POST['destinoId'];
    $distancia = $_POST['distancia'];

    $sql = "INSERT INTO rotas (origemId, destinoId, distancia) VALUES (?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$origemId, $destinoId, $distancia]);

    echo "ok";

?>