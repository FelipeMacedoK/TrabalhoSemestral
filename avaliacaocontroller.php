<?php
require_once 'pgconnect.php';
require_once 'pergunta.php';

$pergunta = new Pergunta();

$dbConnection = (new pgconnect())->getConnection();
if (!$dbConnection) {
    die("Erro ao conectar ao banco de dados.");
}
$input = json_decode(file_get_contents('php://input'), true);
file_put_contents('logs.txt', "Dados recebidos: " . print_r($input, true) . PHP_EOL, FILE_APPEND);
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['acao']) && $_GET['acao'] === 'listar') {
        header('Content-Type: application/json');
        echo json_encode($pergunta->obterPerguntas());
        exit;
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($input['acao']) && $input['acao'] === 'salvarAvaliacao') {
        $avaliacao = [
            'respostas' => $input['respostas'] ?? [],
            'idsetor' => $input['idsetor'] ?? null,
            'iddispositivo' => $input['iddispositivo'] ?? null,
            'feedback' => $input['feedback'] ?? ''
        ];
        file_put_contents('logs.txt', "Salvando avaliação: " . print_r($avaliacao, true) . PHP_EOL, FILE_APPEND);
        $sucesso = salvarAvaliacao($dbConnection, $avaliacao);
        header('Content-Type: application/json');
        echo json_encode(['success' => $sucesso]);
        exit;
    }
}

function salvarAvaliacao($db, $dados) {
    file_put_contents('logs.txt', "Dados para salvar: " . print_r($dados, true) . PHP_EOL, FILE_APPEND);
    
    $idsetor = $dados['idsetor'];
    $iddispositivo = $dados['iddispositivo'];
    $feedback = $dados['feedback'];
    $respostas = $dados['respostas'];
    try {
        pg_query($db, "BEGIN");
        $stmtAvaliacao = pg_prepare($db, "insert_avaliacao", "
            INSERT INTO tbavaliacoes (idsetor, iddispositivo, feedback) 
            VALUES ($1, $2, $3) 
            RETURNING idavaliacao
        ");
        $result = pg_execute($db, "insert_avaliacao", [$idsetor, $iddispositivo, $feedback]);
        $idavaliacao = pg_fetch_result($result, 0, 'idavaliacao');
        $stmtResposta = pg_prepare($db, "insert_resposta", "
            INSERT INTO tbavaliacao_pergunta (idavaliacao, idpergunta, resposta) 
            VALUES ($1, $2, $3)
        ");
        foreach ($respostas as $idpergunta => $resposta) {
            pg_execute($db, "insert_resposta", [$idavaliacao, $idpergunta, $resposta]);
        }

        pg_query($db, "COMMIT");
        return true;
    } catch (Exception $e) {
        pg_query($db, "ROLLBACK");
        file_put_contents('logs.txt', "Erro ao salvar a avaliação: " . $e->getMessage() . PHP_EOL, FILE_APPEND);
        return false;
    }
}
?>