<?php
require __DIR__ . '/../db.php';

$name = $_POST['name'];
$lat = $_POST['lat'];
$lng = $_POST['lng'];
$radio = $_POST['radio'];

try {
  $sql = "INSERT INTO aeroporto (nome, latitude, longitude, radioFrequencia) VALUES (?, ?, ?, ?)";
  $stmt = $pdo->prepare($sql);
  $stmt->execute([$name, (float) $lat, (float) $lng, (float) $radio]);

  echo json_encode([
    'id' => (int) $pdo->lastInsertId(),
    'name' => $name,
    'lat' => (float) $lat,
    'lng' => (float) $lng,
    'radio' => (float) $radio
  ]);
} catch (Throwable $e) {
  echo json_encode([
    'error' => $e->getLine(),
  ]);
}
