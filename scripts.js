document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('perguntasContainer')) carregarPerguntas();
    if (document.getElementById('formCadastrar')) iniciarFormularioCadastro();
    if (document.getElementById('perguntas-container')) iniciarAvaliacao();
    if (document.getElementById('dashboard')) carregarDashboard();
    if (document.getElementById('medias')) carregarMedias();
});

let perguntas = [];
let perguntaAtual = 0;
let respostas = {};
let temporizador;
let tempoInatividade = 30;

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
    const botaoEnviar = document.getElementById('enviar-avaliacao');
    botaoEnviar.addEventListener('click', (event) => {
        botaoEnviar.disabled = true;
        enviarAvaliacao(event);
    });
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

function enviarAvaliacao(event) {
    event.preventDefault();
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
            const mensagem = document.createElement('div');
            mensagem.classList.add('mensagem-sucesso');
            mensagem.innerHTML = 'O Hospital Regional Alto Vale (HRAV) agradece sua resposta e ela é muito importante para nós, pois nos ajuda a melhorar continuamente nossos serviços.';
            document.body.appendChild(mensagem);
            setTimeout(() => {
                window.location.href = "index.html";
            }, 5000);
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

function carregarDashboard() {
    fetch('dashboardcontroller.php')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Erro no backend:', data.error);
                document.getElementById('mensagemErro').textContent = data.error;
                return;
            }
            const avaliacoesContainer = document.getElementById('avaliacoesContainer');
            if (data.length === 0) {
                avaliacoesContainer.innerHTML = '<tr><td colspan="7">Nenhuma avaliação encontrada.</td></tr>';
                return;
            }
            const grupos = {};
            data.forEach(avaliacao => {
                const chaveGrupo = `${avaliacao.setor} - ${avaliacao.dispositivo}`;
                if (!grupos[chaveGrupo]) {
                    grupos[chaveGrupo] = [];
                }
                grupos[chaveGrupo].push(avaliacao);
            });
            let html = '';
            for (const [grupo, avaliacoes] of Object.entries(grupos)) {
                html += `
                    <tr>
                        <td colspan="7"><strong>${grupo}</strong></td>
                    </tr>
                `;
                avaliacoes.forEach(avaliacao => {
                    html += `
                        <tr>
                            <td>${avaliacao.idavaliacao}</td>
                            <td>${avaliacao.data_hora}</td>
                            <td>${avaliacao.idpergunta}</td>
                            <td>${avaliacao.pergunta_descricao}</td>
                            <td>${avaliacao.resposta}</td>
                            <td>${avaliacao.feedback}</td>
                        </tr>
                    `;
                });
            }
            avaliacoesContainer.innerHTML = html;
        })
        .catch(error => {
            console.error('Erro ao carregar dashboard:', error);
            document.getElementById('mensagemErro').textContent = 'Erro ao carregar dashboard.';
        });
}

function carregarMedias() {
    fetch('dashboardcontroller.php?acao=medias')
        .then(response => response.json())
        .then(data => {
            const mediasContainer = document.getElementById('mediasContainer');
            mediasContainer.innerHTML = '';
            if (data.error) {
                mediasContainer.innerHTML = `<tr><td colspan="2">${data.error}</td></tr>`;
                return;
            }
            if (data.length === 0) {
                mediasContainer.innerHTML = '<tr><td colspan="2">Nenhuma média encontrada.</td></tr>';
                return;
            }
            data.forEach(media => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${media.pergunta}</td>
                    <td>${media.media_resposta}</td>
                `;
                mediasContainer.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar médias:', error);
            document.getElementById('mensagemErro').textContent = 'Erro ao carregar médias.';
        });
}

document.addEventListener('input', () => (tempoInatividade = 30));