<?php
require_once 'pgconnect.php';
require_once 'pergunta.php'; 

$pergunta = new Pergunta();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['acao']) && $_GET['acao'] === 'listar') {
        header('Content-Type: application/json');
        echo json_encode($pergunta->obterPerguntas());
        exit;
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);  
    if (isset($input['acao']) && $input['acao'] === 'salvarAvaliacao') {
        $avaliacao = $input['avaliacao'] ?? [];
        $feedback = $input['feedback'] ?? '';
        $sucesso = salvarAvaliacao($avaliacao, $feedback);
        header('Content-Type: application/json');
        echo json_encode(['success' => $sucesso]);
        exit;
    }
}

function salvarAvaliacao($avaliacao, $feedback) {
    global $db;
    try {
        $db->beginTransaction();
        foreach ($avaliacao as $idPergunta => $nota) {
            $stmt = $db->prepare('
                INSERT INTO tbavaliacoes (idsetor, idpergunta, iddispositivo, resposta, feedback) 
                VALUES (:idsetor, :idpergunta, :iddispositivo, :resposta, :feedback)
            ');
            $stmt->execute([
                ':idsetor' => 1,
                ':idpergunta' => $idPergunta,
                ':iddispositivo' => 1,
                ':resposta' => $nota,
                ':feedback' => !empty($feedback) ? $feedback : null,
            ]);
        }
        $db->commit();
        return true;
    } catch (Exception $e) {
        $db->rollBack();
        error_log($e->getMessage());
        return false;
    }
}
?>