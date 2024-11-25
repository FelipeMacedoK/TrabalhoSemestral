document.addEventListener("DOMContentLoaded", function () {
    carregarPerguntasAvaliacao();
    iniciarTimer();
});

let perguntas = [];
let perguntaAtual = 0; 
let respostas = {};
let temporizador;
let tempoInatividade = 30;

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
            ${perguntaAtual === perguntas.length - 1 ? `
            <div>
                <label for="feedback">Feedback adicional:</label>
                <textarea id="feedback" name="feedback" rows="4" cols="50" placeholder="Deixe seu comentário aqui..."></textarea>
            </div>` : ""}
            <button id="proxima-pergunta">
                ${perguntaAtual < perguntas.length - 1 ? "Enviar Resposta" : "Enviar Avaliação"}
            </button>
        `;
        perguntasContainer.appendChild(div);
        document.getElementById('proxima-pergunta').addEventListener('click', () => {
            if (perguntaAtual < perguntas.length - 1) {
                avancarPergunta();
            } else {
                enviarAvaliacao();
            }
        });
    } else {
        perguntasContainer.innerHTML = '<p>Obrigado por responder a avaliação!</p>';
    }
}

function avancarPergunta() {
    const radios = document.querySelectorAll(`input[name="nota-${perguntas[perguntaAtual].idpergunta}"]:checked`);
    if (radios.length === 0) {
        alert("Por favor, selecione uma nota antes de continuar!");
        return;
    }
    const notaSelecionada = radios[0].value;
    respostas[perguntas[perguntaAtual].idpergunta] = notaSelecionada;
    perguntaAtual++;
    exibirPergunta();
}

function enviarAvaliacao() {
    const feedback = document.getElementById('feedback')?.value || "";
    fetch('avaliacaocontroller.php', {
        method: 'POST',
        body: JSON.stringify({ 
            acao: 'salvarAvaliacao', 
            avaliacao: respostas, 
            feedback: feedback 
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Avaliação salva com sucesso!');
            window.location.href = 'index.html';
        } else {
            alert('Erro ao salvar avaliação.');
        }
    })
    .catch(error => console.error('Erro ao salvar avaliação:', error));
}

const contadorTempo = document.getElementById('contador');
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
    contadorTempo.textContent = `Tempo restante: ${tempoInatividade} segundos`;
}

document.addEventListener('input', () => (tempoInatividade = 30));