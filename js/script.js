// Estado Global da Aplicação
let bancoQuestoesJSON = [];
let indiceAtual = 0;
let acertos = 0;
let respondido = false;

// Seletores do DOM
const microscopeContainer = document.getElementById('microscope-container');
const microscopeScreen = document.getElementById('microscope-screen');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const feedbackPanel = document.getElementById('feedback-panel');
const feedbackStatus = document.getElementById('feedback-status');
const rationaleText = document.getElementById('rationale-text');
const btnAction = document.getElementById('btn-action');
const progressText = document.getElementById('progress-text');
const scoreText = document.getElementById('score-text');
const progressBar = document.getElementById('progress-bar');

// [NOVO] Função Assíncrona para buscar os dados do arquivo JSON externo
async function inicializarAplicacao() {
    try {
        const resposta = await fetch('js/questoes.json');
        if (!resposta.ok) {
            throw new Error(`Erro HTTP! status: ${resposta.status}`);
        }
        bancoQuestoesJSON = await resposta.json();
        carregarCard(); // Só carrega o primeiro card quando o JSON estiver pronto
    } catch (erro) {
        console.error("Falha ao carregar o banco de questões JSON:", erro);
        questionText.textContent = "Erro ao carregar o simulador. Verifique o console.";
    }
}

function carregarCard() {
    if (bancoQuestoesJSON.length === 0) return;

    respondido = false;
    btnAction.classList.add('d-none');
    feedbackPanel.classList.add('d-none');
    optionsContainer.innerHTML = '';

    const questao = bancoQuestoesJSON[indiceAtual];
    
    if (questao.urlImagem) {
        microscopeScreen.src = questao.urlImagem;
        microscopeContainer.classList.remove('d-none');
    } else {
        microscopeContainer.classList.add('d-none');
    }
    
    questionText.textContent = questao.enunciado;
    progressText.textContent = `Questão ${indiceAtual + 1} de ${bancoQuestoesJSON.length}`;
    scoreText.textContent = `Acertos: ${acertos}`;
    
    const porcentagem = ((indiceAtual + 1) / bancoQuestoesJSON.length) * 100;
    progressBar.style.width = `${porcentagem}%`;

    questao.opcoes.forEach((opcao, index) => {
        const botao = document.createElement('button');
        botao.className = 'btn btn-option p-3 text-start rounded-3';
        botao.textContent = opcao;
        botao.onclick = () => verificarResposta(index);
        optionsContainer.appendChild(botao);
    });
}

function verificarResposta(opcaoSelecionada) {
    if (respondido) return;
    respondido = true;

    const questao = bancoQuestoesJSON[indiceAtual];
    const botoes = optionsContainer.getElementsByTagName('button');

    botoes[questao.indexCorreto].classList.add('correct-answer');

    if (opcaoSelecionada === questao.indexCorreto) {
        acertos++;
        scoreText.textContent = `Acertos: ${acertos}`;
        feedbackStatus.textContent = "🎉 Parabéns, você ACERTOU!";
        feedbackStatus.className = "fw-bold mb-3 text-center text-success";
    } else {
        botoes[opcaoSelecionada].classList.add('wrong-answer');
        feedbackStatus.textContent = "❌ Não foi desta vez, você ERROU! Mas não desanime, continue estudando.";
        feedbackStatus.className = "fw-bold mb-3 text-center text-danger";
    }

    for (let i = 0; i < botoes.length; i++) {
        botoes[i].setAttribute('disabled', 'true');
    }

    rationaleText.textContent = questao.justificativa;
    feedbackPanel.classList.remove('d-none');

    if (indiceAtual < bancoQuestoesJSON.length - 1) {
        btnAction.textContent = "Próximo Card →";
    } else {
        btnAction.textContent = "Reiniciar Treinamento 🔄";
    }
    btnAction.classList.remove('d-none');
}

btnAction.onclick = () => {
    if (indiceAtual < bancoQuestoesJSON.length - 1) {
        indiceAtual++;
        carregarCard();
    } else {
        indiceAtual = 0;
        acertos = 0;
        carregarCard();
    }
};

// Dispara a inicialização assíncrona assim que a janela estiver pronta
window.onload = inicializarAplicacao;