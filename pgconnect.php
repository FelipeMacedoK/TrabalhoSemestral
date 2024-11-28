<?php
/*
Tabelas do Banco:

CREATE TABLE tbusuarios (
    idusuario SERIAL PRIMARY KEY,
    login VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL
);

CREATE TABLE tbsetores (
    idsetor SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL
);

CREATE TABLE tbperguntas (
    idpergunta SERIAL PRIMARY KEY,
    texto TEXT NOT NULL,
    status BOOLEAN NOT NULL
);

CREATE TABLE tbdispositivos (
    iddispositivo SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    status BOOLEAN NOT NULL
);

CREATE TABLE tbavaliacoes (
    idavaliacao SERIAL PRIMARY KEY,
    idsetor INTEGER REFERENCES tbsetores(idsetor),
    iddispositivo INTEGER REFERENCES tbdispositivos(iddispositivo),
    feedback TEXT,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE tbavaliacao_pergunta (
    idavaliacao INTEGER REFERENCES tbavaliacoes(idavaliacao),
    idpergunta INTEGER REFERENCES tbperguntas(idpergunta),
    resposta INTEGER NOT NULL,
    PRIMARY KEY (idavaliacao, idpergunta)
);
*/

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