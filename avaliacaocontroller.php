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
}
?>