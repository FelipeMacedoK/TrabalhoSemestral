<?php
require_once 'pergunta.php';

$pergunta = new Pergunta();

if (isset($_GET['acao'])) {
    switch ($_GET['acao']) {
        case 'listar':
            header('Content-Type: application/json');
            echo json_encode($pergunta->obterPerguntas());
            break;
        case 'cadastrar':
            if (isset($_POST['texto'])) {
                $pergunta->cadastrarPergunta($_POST['texto']);
                echo "Pergunta cadastrada com sucesso!";
            } else {
                echo "Erro: Texto da pergunta não fornecido.";
            }
            break;
        case 'remover':
            if (isset($_POST['id'])) {
                $pergunta->removerPergunta($_POST['id']);
                echo "Pergunta removida com sucesso!";
            } else {
                echo "Erro: ID da pergunta não fornecido.";
            }
            break;
        case 'alterarStatus':
                $status = filter_var($_POST['status'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
                if ($status !== null) {
                    if ($pergunta->alterarStatusPergunta($_POST['id'], $status)) {
                        echo $status ? "Pergunta ativada com sucesso!" : "Pergunta desativada com sucesso!";
                    } else {
                        echo "Erro ao alterar o status da pergunta.";
                    }
                } 
            break;
        default:
            echo "Ação inválida.";
    }
}
?>