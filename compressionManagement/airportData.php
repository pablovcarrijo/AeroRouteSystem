<?php

    require __DIR__ ."/../db.php";
    try{

        $sql = "SELECT idAeroporto AS codigo, nome, latitude, longitude FROM aeroporto";
        $stmt = $pdo->query($sql);
        $airports = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($airports);
    }
    catch(Exception $e){
        echo "algo deu errado";
    }

?>