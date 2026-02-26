<?php

require __DIR__ . "/../../db.php";

$sql = "SELECT idAeroporto AS id, nome AS name FROM aeroporto";
$stmt = $pdo->query($sql);
$airports = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($airports);

?>