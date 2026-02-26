<?php

    require __DIR__ ."/../db.php";

    try{
        $sql = "SELECT idAeroporto AS id, nome AS name, latitude AS lat, longitude AS lng, 
        radioFrequencia AS radio FROM aeroporto";
        $stmt = $pdo->query($sql);
        $airports = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($airports);        
    }
    catch(err){
        echo "deu algum erro";
    }

?>