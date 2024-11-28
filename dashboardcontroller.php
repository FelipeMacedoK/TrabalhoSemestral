<?php
require 'pgconnect.php';

header('Content-Type: application/json');

try {
    $conn = (new pgconnect())->getConnection();
    
    $sql = "
        SELECT
            tbavaliacoes.idavaliacao,
            tbsetores.nome AS setor,
            tbdispositivos.nome AS dispositivo,
            tbavaliacoes.feedback,
            tbavaliacoes.data_hora,
            tbavaliacao_pergunta.idpergunta,
            tbavaliacao_pergunta.resposta
        FROM tbavaliacoes
        INNER JOIN tbsetores ON tbavaliacoes.idsetor = tbsetores.idsetor
        INNER JOIN tbdispositivos ON tbavaliacoes.iddispositivo = tbdispositivos.iddispositivo
        LEFT JOIN tbavaliacao_pergunta ON tbavaliacoes.idavaliacao = tbavaliacao_pergunta.idavaliacao
        ORDER BY tbavaliacoes.data_hora DESC;
    ";
    $result = pg_query($conn, $sql);

    if (!$result) {
        throw new Exception("Erro ao buscar avaliações.");
    }

    $avaliacoes = [];
    while ($row = pg_fetch_assoc($result)) {
        $avaliacoes[] = $row;
    }

    echo json_encode($avaliacoes);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>