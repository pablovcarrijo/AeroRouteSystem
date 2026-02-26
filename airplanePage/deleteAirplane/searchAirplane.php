<?php

    require __DIR__ ."/../../db.php";
    try{

        $sql = "SELECT codigoAeronave AS codigo, empresaResponsavel AS empresa, modeloAviao AS modelo, capacidadeMaxima AS capacidade, rotaAeronave AS rota FROM aeronave";
        $stmt = $pdo->query($sql);
        $airplanes = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($airplanes);
    }
    catch(Exception $e){
        echo "algo deu errado";
    }

?>