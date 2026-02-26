<?php

    require __DIR__ ."/../../db.php";

    try {
        $sql = "SELECT idAeroporto, nome, latitude, longitude, radioFrequencia FROM aeroporto";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        $airports = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($airports);
    } catch (Exception $e) {
        echo "algo deu errado";
    }

?>