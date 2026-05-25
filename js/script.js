// Estado Global da Aplicação
let bancoQuestoesJSON = [];
let indiceAtual = 0;
let acertos = 0;
let respondido = false;

// Seletores das Telas de Fluxo (Welcome vs Quiz)
const welcomeContainer = document.getElementById('welcome-container');
const quizContainer = document.getElementById('quiz-container');
const btnStart = document.getElementById('btn-start');

// Seletores do DOM Operacionais
const microscopeContainer = document.getElementById('microscope-container');
const microscopeScreen = document.getElementById('microscope-screen');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const feedbackPanel = document.getElementById('feedback-panel');
const feedbackStatus = document.getElementById('feedback-status');
const rationaleText = document.getElementById('rationale-text');
const btnAction = document.getElementById('btn-action');
const btnExit = document.getElementById('btn-exit');
const progressText = document.getElementById('progress-text');
const scoreText = document.getElementById('score-text');
const progressBar = document.getElementById('progress-bar');

// Função Assíncrona para buscar os dados do arquivo JSON externo
async function inicializarAplicacao() {
    try {
        const resposta = await fetch('js/questoes.json');
        if (!resposta.ok) {
            throw new Error(`Erro HTTP! status: ${resposta.status}`);
        }
        bancoQuestoesJSON = await resposta.json();
        
        // Mapeamento reativo do clique no botão INICIAR da Welcome Screen
        if (btnStart) {
            btnStart.onclick = () => {
                if (welcomeContainer) welcomeContainer.classList.add('d-none'); // Oculta Boas-Vindas
                if (quizContainer) quizContainer.classList.remove('d-none');   // Exibe o Simulador
                carregarCard(); // Agora sim monta e exibe a primeira lâmina biológica
            };
        }

        // Atribui com segurança o evento de clique do botão Sair no rodapé inferior
        if (btnExit) {
            btnExit.onclick = () => encerrarSimuladoPrematuro();
        }

    } catch (erro) {
        console.error("Falha ao carregar o banco de questões JSON:", erro);
        if (questionText) {
            questionText.textContent = "Erro ao carregar o simulador. Certifique-se de usar o Live Server.";
        }
    }
}

function carregarCard() {
    if (bancoQuestoesJSON.length === 0) return;

    respondido = false;
    if (btnAction) btnAction.classList.add('d-none');
    if (feedbackPanel) feedbackPanel.classList.add('d-none');
    if (optionsContainer) optionsContainer.innerHTML = '';

    const questao = bancoQuestoesJSON[indiceAtual];
    
    // Controle do microscópio virtual
    if (questao.urlImagem) {
        if (microscopeScreen) microscopeScreen.src = questao.urlImagem;
        if (microscopeContainer) microscopeContainer.classList.remove('d-none');
    } else {
        if (microscopeContainer) microscopeContainer.classList.add('d-none');
    }
    
    if (questionText) questionText.innerHTML = questao.enunciado;
    if (progressText) progressText.textContent = `Questão ${indiceAtual + 1} de ${bancoQuestoesJSON.length}`;
    if (scoreText) scoreText.textContent = `Acertos: ${acertos}`;
    
    if (progressBar) {
        const porcentagem = ((indiceAtual + 1) / bancoQuestoesJSON.length) * 100;
        progressBar.style.width = `${porcentagem}%`;
    }

    // Geração dinâmica das alternativas de múltipla escolha
    if (optionsContainer) {
        questao.opcoes.forEach((opcao, index) => {
            const botao = document.createElement('button');
            botao.className = 'btn btn-option p-3 text-start rounded-3';
            botao.textContent = opcao;
            botao.onclick = () => verificarResposta(index);
            optionsContainer.appendChild(botao);
        });
    }
}

function verificarResposta(opcaoSelecionada) {
    if (respondido) return;
    respondido = true;

    const questao = bancoQuestoesJSON[indiceAtual];
    const botoes = optionsContainer.getElementsByTagName('button');

    // Sempre destaca a alternativa correta em verde utilitário
    botoes[questao.indexCorreto].classList.add('correct-answer');

    if (opcaoSelecionada === questao.indexCorreto) {
        acertos++;
        if (scoreText) scoreText.textContent = `Acertos: ${acertos}`;
        if (feedbackStatus) {
            feedbackStatus.textContent = "🎉 Parabéns, você ACERTOU!";
            feedbackStatus.className = "fw-bold mb-3 text-center text-success";
        }
    } else {
        // Destaca a alternativa errada clicada em vermelho utilitário
        botoes[opcaoSelecionada].classList.add('wrong-answer');
        if (feedbackStatus) {
            feedbackStatus.textContent = "❌ Não foi desta vez, você ERROU! Mas não desanime, continue estudando.";
            feedbackStatus.className = "fw-bold mb-3 text-center text-danger";
        }
    }

    // Bloqueia interações adicionais nas outras alternativas
    for (let i = 0; i < botoes.length; i++) {
        botoes[i].setAttribute('disabled', 'true');
    }

    // Exibe a análise morfológica interpretando negritos em HTML (innerHTML)
    if (rationaleText) rationaleText.innerHTML = questao.justificativa;
    if (feedbackPanel) feedbackPanel.classList.remove('d-none');

    if (btnAction) {
        if (indiceAtual < bancoQuestoesJSON.length - 1) {
            btnAction.textContent = "Próximo Card →";
        } else {
            btnAction.textContent = "Finalizar Treinamento 🏁";
        }
        btnAction.classList.remove('d-none');
    }
}

function encerrarSimuladoPrematuro() {
    // Oculta os painéis operacionais do quiz
    if (microscopeContainer) microscopeContainer.classList.add('d-none');
    if (feedbackPanel) feedbackPanel.classList.add('d-none');
    if (btnAction) btnAction.classList.add('d-none');
    if (btnExit) btnExit.classList.add('d-none');

    const respondidas = respondido ? indiceAtual + 1 : indiceAtual;
    const taxaAproveitamento = respondidas > 0 ? Math.round((acertos / respondidas) * 100) : 0;

    exibirTelaDeRelatorio(respondidas, taxaAproveitamento);
}

function exibirTelaDeRelatorio(respondidas, taxaAproveitamento) {
    if (questionText) {
        questionText.innerHTML = `
            <div class="text-center py-3">
                <h4 class="fw-bold text-dark mb-3">Treinamento Concluído</h4>
                <p class="text-muted small">Desempenho consolidado obtido na análise das lâminas microscópicas.</p>
                <hr class="my-4">
                <div class="row g-3 mb-4">
                    <div class="col-6 border-end">
                        <span class="text-muted small d-block">Cards Analisados</span>
                        <strong class="fs-4 text-dark">${respondidas} / ${bancoQuestoesJSON.length}</strong>
                    </div>
                    <div class="col-6">
                        <span class="text-muted small d-block">Taxa de Acerto</span>
                        <strong class="fs-4 text-primary">${taxaAproveitamento}%</strong>
                    </div>
                </div>
                <p class="small text-muted">A prática constante leva à excelência no diagnóstico laboratorial!</p>
            </div>
        `;
    }

    if (optionsContainer) {
        optionsContainer.innerHTML = '';
        const btnRestart = document.createElement('button');
        btnRestart.className = 'btn btn-primary p-3 rounded-pill fw-bold mt-2 w-100';
        btnRestart.textContent = 'Voltar à Tela Inicial 🔄';
        
        btnRestart.onclick = () => {
            indiceAtual = 0;
            acertos = 0;
            if (btnExit) btnExit.classList.remove('d-none');
            if (quizContainer) quizContainer.classList.add('d-none');
            if (welcomeContainer) welcomeContainer.classList.remove('d-none'); // Retorna para o início
        };
        optionsContainer.appendChild(btnRestart);
    }
}

// Configuração do botão principal de ação/avanço
if (btnAction) {
    btnAction.onclick = () => {
        if (indiceAtual < bancoQuestoesJSON.length - 1) {
            indiceAtual++;
            carregarCard();
        } else {
            if (microscopeContainer) microscopeContainer.classList.add('d-none');
            if (feedbackPanel) feedbackPanel.classList.add('d-none');
            if (btnAction) btnAction.classList.add('d-none');
            if (btnExit) btnExit.classList.add('d-none');
            
            exibirTelaDeRelatorio(bancoQuestoesJSON.length, Math.round((acertos / bancoQuestoesJSON.length) * 100));
        }
    };
}

// Inicialização segura ao carregar a página
window.onload = inicializarAplicacao;