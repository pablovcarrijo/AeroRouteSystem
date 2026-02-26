<?php

    require __DIR__ . "/../../db.php";
    try {
        $data = json_decode(file_get_contents("php://input"), true);
        $codigo = $data["codigo"];

        $sql = "DELETE FROM aeronave WHERE codigoAeronave = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$codigo]);

        if ($stmt->rowCount() > 0) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false, "message" => "Aeronave não encontrada"]);
        }

    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }

?>