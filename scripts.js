document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('perguntasContainer')) carregarPerguntas();
    if (document.getElementById('formCadastrar')) iniciarFormularioCadastro();
    if (document.getElementById('perguntas-container')) iniciarAvaliacao();
    if (document.getElementById('dashboard')) carregarAvaliacoes();
});

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

function iniciarFormularioCadastro() {
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
}

function removerPergunta(id) {
    if (confirm("Tem certeza de que deseja remover esta pergunta?")) {
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

let perguntas = [];
let perguntaAtual = 0;
let respostas = {};
let temporizador;
let tempoInatividade = 30;

function iniciarAvaliacao() {
    carregarPerguntasAvaliacao();
    iniciarTimer();
}

function carregarPerguntasAvaliacao() {
    fetch('avaliacaocontroller.php?acao=listar')
        .then(response => response.json())
        .then(data => {
            perguntas = data;
            exibirPergunta();
        })
        .catch(error => console.error('Erro ao carregar perguntas:', error));
}

function exibirPergunta() {
    const perguntasContainer = document.getElementById('perguntas-container');
    perguntasContainer.innerHTML = '';
    if (perguntaAtual < perguntas.length) {
        const pergunta = perguntas[perguntaAtual];
        const div = document.createElement('div');
        div.innerHTML = `
            <p class="pergunta">${pergunta.texto}</p>
            <div class="escala">
                ${[...Array(11).keys()]
                    .map(
                        nota => `
                        <input type="radio" id="nota${nota}-${pergunta.idpergunta}" name="nota-${pergunta.idpergunta}" value="${nota}" 
                        ${respostas[pergunta.idpergunta] == nota ? "checked" : ""}>
                        <label class="nota nota${nota}" for="nota${nota}-${pergunta.idpergunta}">${nota}</label>
                    `
                    )
                    .join('')}
            </div><br>
            <button id="proxima-pergunta">
                ${perguntaAtual < perguntas.length ? "Enviar Resposta" : "Enviar Feedback"}
            </button>
        `;
        perguntasContainer.appendChild(div);
        document.getElementById('proxima-pergunta').addEventListener('click', () => {
            if (perguntaAtual < perguntas.length - 1) {
                avancarPergunta();
            } else {
                avancarPergunta();
                exibirFeedback();
            }
        });
    } else {
        perguntasContainer.innerHTML = '<p>Obrigado por responder a avaliação!</p>';
    }
}

function exibirFeedback() {
    const perguntasContainer = document.getElementById('perguntas-container');
    perguntasContainer.innerHTML = `
        <div>
            <label for="feedback">Feedback adicional:</label>
            <textarea id="feedback" name="feedback" rows="4" cols="50" placeholder="Deixe seu comentário aqui..."></textarea>
        </div>
        <button id="enviar-avaliacao">Enviar Avaliação</button>
    `;
    document.getElementById('enviar-avaliacao').addEventListener('click', enviarAvaliacao);
}

function avancarPergunta() {
    const radios = document.querySelectorAll(`input[name="nota-${perguntas[perguntaAtual].idpergunta}"]:checked`);
    if (radios.length === 0) {
        alert("Por favor, selecione uma nota antes de continuar!");
        return;
    }
    const notaSelecionada = radios[0].value;
    respostas[perguntas[perguntaAtual].idpergunta] = notaSelecionada;

    console.log("Resposta registrada:", {
        idpergunta: perguntas[perguntaAtual].idpergunta,
        nota: notaSelecionada,
    });
    perguntaAtual++;
    exibirPergunta();
}

function enviarAvaliacao() {
    const feedback = document.getElementById("feedback")?.value || "";
    fetch("avaliacaocontroller.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            acao: "salvarAvaliacao",
            respostas: respostas,
            idsetor: 1,
            iddispositivo: 1,
            feedback: feedback
        }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Avaliação salva com sucesso!");
                window.location.href = "index.html";
            } else {
                alert("Erro ao salvar avaliação: " + (data.error || "Erro desconhecido."));
            }
        })
        .catch(error => {
            console.error("Erro na comunicação com o backend:", error);
            alert("Erro na comunicação com o servidor. Verifique o console para mais detalhes.");
        });
}

function iniciarTimer() {
    atualizarContador();
    temporizador = setInterval(() => {
        if (tempoInatividade <= 0) {
            window.location.href = 'index.html';
        } else {
            atualizarContador();
            tempoInatividade--;
        }
    }, 1000);
}

function atualizarContador() {
    const contadorTempo = document.getElementById('contador');
    if (contadorTempo) {
        contadorTempo.textContent = `Tempo restante: ${tempoInatividade} segundos`;
    }
}

function carregarAvaliacoes() {
    fetch('avaliacaocontroller.php')
        .then(response => response.json())
        .then(avaliacoes => {
            const avaliacoesContainer = document.getElementById('avaliacoesContainer');
            avaliacoesContainer.innerHTML = '';
            avaliacoes.forEach(avaliacao => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${avaliacao.idavaliacao}</td>
                    <td>${avaliacao.setor}</td>
                    <td>${avaliacao.dispositivo}</td>
                    <td>${avaliacao.feedback}</td>
                    <td>${new Date(avaliacao.data_hora).toLocaleString()}</td>
                    <td>${avaliacao.idpergunta}</td>
                    <td>${avaliacao.resposta}</td>
                `;
                avaliacoesContainer.appendChild(row);
            });
        })
        .catch(error => console.error('Erro ao carregar avaliações:', error));
}

function mostrarAba(abaId) {
    const abas = document.querySelectorAll('.aba');
    abas.forEach(aba => aba.style.display = 'none');
  
    const abaAtiva = document.getElementById(abaId);
    if (abaAtiva) abaAtiva.style.display = 'block';
  }
  
  document.getElementById('btn-relatorios').addEventListener('click', () => {
    mostrarAba('relatorios');
  });
  

document.addEventListener('input', () => (tempoInatividade = 30));