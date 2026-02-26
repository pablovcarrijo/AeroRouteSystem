<?php
    require __DIR__ . "/../db.php";

    $sql = "SELECT * FROM rotas";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $routesFromDb = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($routesFromDb);

?>