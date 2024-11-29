<?php
require 'pgconnect.php';

header('Content-Type: application/json');

try {
    $conn = (new pgconnect())->getConnection();
    $acao = $_GET['acao'] ?? '';
    if ($acao === 'medias') {
        $sql = "
            SELECT
                tbperguntas.texto AS pergunta,
                ROUND(AVG(tbavaliacao_pergunta.resposta), 2) AS media_resposta
            FROM tbavaliacao_pergunta
            INNER JOIN tbperguntas ON tbavaliacao_pergunta.idpergunta = tbperguntas.idpergunta
            GROUP BY tbperguntas.texto
            ORDER BY tbperguntas.texto;
        ";
    } else {
        $sql = "
            SELECT
                tbavaliacoes.idavaliacao,
                tbsetores.nome AS setor,
                tbdispositivos.nome AS dispositivo,
                tbavaliacoes.feedback,
                TO_CHAR(tbavaliacoes.data_hora, 'DD/MM/YYYY HH24:MI') AS data_hora,
                tbavaliacao_pergunta.idpergunta,
                tbperguntas.texto AS pergunta_descricao,
                tbavaliacao_pergunta.resposta
            FROM tbavaliacoes
            INNER JOIN tbsetores ON tbavaliacoes.idsetor = tbsetores.idsetor
            INNER JOIN tbdispositivos ON tbavaliacoes.iddispositivo = tbdispositivos.iddispositivo
            LEFT JOIN tbavaliacao_pergunta ON tbavaliacoes.idavaliacao = tbavaliacao_pergunta.idavaliacao
            LEFT JOIN tbperguntas ON tbavaliacao_pergunta.idpergunta = tbperguntas.idpergunta
            ORDER BY tbavaliacoes.data_hora DESC, tbavaliacao_pergunta.idpergunta;
        ";
    }
    $result = pg_query($conn, $sql);
    if (!$result) {
        throw new Exception("Erro ao executar a consulta.");
    }
    $dados = [];
    while ($row = pg_fetch_assoc($result)) {
        $dados[] = $row;
    }
    echo json_encode($dados);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>