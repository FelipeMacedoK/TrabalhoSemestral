<?php

class pgconnect {
    private $connection;

    public function __construct($host = 'localhost', $port = '5432', $dbname = 'SistemadeAvaliacao', $user = 'postgres', $password = 'postgres') {
        $this->connection = pg_connect("host=$host port=$port dbname=$dbname user=$user password=$password");
        if (!$this->connection) {
            echo "Erro ao conectar ao banco de dados.";
        }
    }

    public function getConnection() {
        return $this->connection;
    }
}