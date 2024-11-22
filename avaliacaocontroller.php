<?php
require_once 'pgconnect.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if ($data['acao'] === 'salvarAvaliacao') {
        $avaliacoes = $data['avaliacao'];

        $db = new pgconnect();
        $connection = $db->getConnection();

        $success = true;

        foreach ($avaliacoes as $idPergunta => $nota) {
            $query = "INSERT INTO tbavaliacoes (idpergunta, nota) VALUES ($1, $2)";
            $params = [$idPergunta, $nota];
            $result = pg_query_params($connection, $query, $params);

            if (!$result) {
                $success = false;
                break;
            }
        }

        echo json_encode(['success' => $success]);
        exit;
    }
}
?>