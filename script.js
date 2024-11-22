document.addEventListener("DOMContentLoaded", carregarPerguntas);

function carregarPerguntas() {
    fetch('perguntacontroller.php?acao=listar')
        .then(response => response.json())
        .then(perguntas => {
            const perguntasContainer = document.getElementById('perguntasContainer');
            perguntasContainer.innerHTML = '';
            perguntas.forEach(pergunta => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${pergunta.idpergunta}</td>
                    <td>${pergunta.texto}</td>
                    <td>${pergunta.status}</td>
                    <td>
                        <button onclick="alterarStatusPergunta(${pergunta.idpergunta})">
                            ${pergunta.status === 'Ativo' ? 'Desativar' : 'Ativar'}
                        </button>
                        <button onclick="removerPergunta(${pergunta.idpergunta})">Remover</button>
                    </td>
                `;
                perguntasContainer.appendChild(row);
            });
        })
        .catch(error => console.error('Erro ao carregar perguntas:', error));
}

document.getElementById('formCadastrar').addEventListener('submit', function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    fetch('perguntacontroller.php?acao=cadastrar', { method: 'POST', body: formData })
        .then(response => response.text())
        .then(result => {
            alert(result);
            carregarPerguntas();
            this.reset();
        })
        .catch(error => console.error('Erro ao cadastrar pergunta:', error));
});

function removerPergunta(id) {
    const formData = new FormData();
    formData.append('id', id);
    fetch('perguntacontroller.php?acao=remover', { method: 'POST', body: formData })
        .then(response => response.text())
        .then(result => {
            alert(result);
            carregarPerguntas();
        })
        .catch(error => console.error('Erro ao remover pergunta:', error));
}

function alterarStatusPergunta(id) {
    const formData = new FormData();
    formData.append('id', id);
    fetch('perguntacontroller.php?acao=alterarStatus', { method: 'POST', body: formData })
        .then(response => response.text())
        .then(result => {
            alert(result);
            carregarPerguntas();
        })
        .catch(error => console.error('Erro ao alterar status:', error));
}