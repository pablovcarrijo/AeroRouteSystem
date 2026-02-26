<?php
require __DIR__ . '/../db.php';

$idAeroporto = $_POST['id'];
$radio = $_POST['radio'];

try {
  $sql = "UPDATE aeroporto SET radioFrequencia = (?) WHERE idAeroporto = (?)";
  $stmt = $pdo->prepare($sql);
  $stmt->execute([$radio, $idAeroporto]);

  echo json_encode([
    'radio' => (float) $radio
  ]);
} catch (Throwable $e) {
  echo json_encode([
    'error' => $e->getLine(),
  ]);
}
