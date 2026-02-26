<?php
require __DIR__ . '/../db.php';

$pdo->beginTransaction();

$pdo->exec("DELETE FROM aeronave");
$pdo->exec("DELETE FROM rotas");
$pdo->exec("DELETE FROM aeroporto");

$pdo->commit();



