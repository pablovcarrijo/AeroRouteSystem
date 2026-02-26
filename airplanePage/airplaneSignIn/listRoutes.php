<?php

require __DIR__ . "/../../db.php";

$sql = "SELECT idRota, origemId, destinoId, distancia FROM rotas";
$stmt = $pdo->query($sql);
$routesLoaded = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($routesLoaded);

?>