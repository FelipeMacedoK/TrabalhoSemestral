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
            if (isset($_POST['id'])) {
                $pergunta->alterarStatusPergunta($_POST['id']);
                echo "Status alterado com sucesso!";
            } else {
                echo "Erro: ID da pergunta não foi enviado.";
            }
            break;

        default:
            echo "Ação inválida.";
    }
}
?>