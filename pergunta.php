<?php
require_once 'pgconnect.php';

class Pergunta {
    private $connection;

    public function __construct() {
        $db = new pgconnect();
        $this->connection = $db->getConnection();
    }

    public function obterPerguntas() {
        $query = "SELECT idpergunta, texto, CASE WHEN status THEN 'Ativo' ELSE 'Inativo' END AS status FROM tbperguntas";
        $result = pg_query($this->connection, $query);
        $perguntas = [];
        if ($result) {
            while ($row = pg_fetch_assoc($result)) {
                $perguntas[] = $row;
            }
        }
        return $perguntas;
    }

    public function cadastrarPergunta($texto) {
        $query = "INSERT INTO tbperguntas (texto, status) VALUES ($1, TRUE)";
        return pg_query_params($this->connection, $query, [$texto]);
    }

    public function removerPergunta($id) {
        $query = "DELETE FROM tbperguntas WHERE idpergunta = $1";
        return pg_query_params($this->connection, $query, [$id]);
    }

    public function alterarStatusPergunta($id) {
        $query = "UPDATE tbperguntas SET status = NOT status WHERE idpergunta = $1";
        return pg_query_params($this->connection, $query, [$id]);
    }
}
?>