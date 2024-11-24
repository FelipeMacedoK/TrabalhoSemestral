document.addEventListener("DOMContentLoaded", function() {
    carregarPerguntasAvaliacao();
    iniciarTimer();
});

function carregarPerguntasAvaliacao() {
    fetch('avaliacaocontroller.php?acao=listar')
        .then(response => response.json())
        .then(perguntas => {
            const perguntasContainer = document.getElementById('perguntas-container');
            perguntasContainer.innerHTML = '';
            perguntas.forEach(pergunta => {
                const div = document.createElement('div');
                div.innerHTML = `
                    <p>${pergunta.texto}</p>
                    <div class="escala">
                        <input type="radio" id="nota0-${pergunta.idpergunta}" name="nota-${pergunta.idpergunta}" value="0"><label for="nota0-${pergunta.idpergunta}">0</label>
                        <input type="radio" id="nota1-${pergunta.idpergunta}" name="nota-${pergunta.idpergunta}" value="1"><label for="nota1-${pergunta.idpergunta}">1</label>
                        <input type="radio" id="nota2-${pergunta.idpergunta}" name="nota-${pergunta.idpergunta}" value="2"><label for="nota2-${pergunta.idpergunta}">2</label>
                        <input type="radio" id="nota3-${pergunta.idpergunta}" name="nota-${pergunta.idpergunta}" value="3"><label for="nota3-${pergunta.idpergunta}">3</label>
                        <input type="radio" id="nota4-${pergunta.idpergunta}" name="nota-${pergunta.idpergunta}" value="4"><label for="nota4-${pergunta.idpergunta}">4</label>
                        <input type="radio" id="nota5-${pergunta.idpergunta}" name="nota-${pergunta.idpergunta}" value="5"><label for="nota5-${pergunta.idpergunta}">5</label>
                        <input type="radio" id="nota6-${pergunta.idpergunta}" name="nota-${pergunta.idpergunta}" value="6"><label for="nota6-${pergunta.idpergunta}">6</label>
                        <input type="radio" id="nota7-${pergunta.idpergunta}" name="nota-${pergunta.idpergunta}" value="7"><label for="nota7-${pergunta.idpergunta}">7</label>
                        <input type="radio" id="nota8-${pergunta.idpergunta}" name="nota-${pergunta.idpergunta}" value="8"><label for="nota8-${pergunta.idpergunta}">8</label>
                        <input type="radio" id="nota9-${pergunta.idpergunta}" name="nota-${pergunta.idpergunta}" value="9"><label for="nota9-${pergunta.idpergunta}">9</label>
                        <input type="radio" id="nota10-${pergunta.idpergunta}" name="nota-${pergunta.idpergunta}" value="10"><label for="nota10-${pergunta.idpergunta}">10</label>
                    </div>
                `;
                perguntasContainer.appendChild(div);
            });
        })
        .catch(error => console.error('Erro ao carregar perguntas:', error));
}

let tempoInatividade = 30;
let temporizador;

const contadorTempo = document.getElementById('contador');

function atualizarContador() {
    if (tempoInatividade <= 0) {
        window.location.href = 'index.html'; 
    } else {
        contadorTempo.textContent = `Tempo restante: ${tempoInatividade} segundos`;
        tempoInatividade--;
    }
}

function iniciarTimer() {
    temporizador = setInterval(atualizarContador, 1000);
}

document.getElementById('avaliacao-form').addEventListener('input', function() {
    tempoInatividade = 30;
});

document.getElementById('avaliacao-form').addEventListener('submit', function(e) {
    e.preventDefault(); 

    const formData = new FormData(this);
    const avaliacao = {};

    formData.forEach((value, key) => {
        if (key.startsWith('nota-')) {
            const idPergunta = key.split('-')[1];
            avaliacao[idPergunta] = value;
        }
    });

    fetch('avaliacaocontroller.php', {
        method: 'POST',
        body: JSON.stringify({ acao: 'salvarAvaliacao', avaliacao: avaliacao }),
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
});