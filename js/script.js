// Estado Global da Aplicação
let bancoQuestoesCompleto = []; 
let bancoQuestoesFiltrado = []; 
let indiceAtual = 0;
let acertos = 0;
let respondido = false;
let topicoSelecionadoTemporario = ""; // Guarda o tópico escolhido entre as transições de tela

// Seletores das Telas de Fluxo (Containers Principais)
const welcomeContainer = document.getElementById('welcome-container');
const topicsContainer = document.getElementById('topics-container');
const difficultyContainer = document.getElementById('difficulty-container');
const quizContainer = document.getElementById('quiz-container');

// Seletores de Ação de Fluxo Global
const btnStart = document.getElementById('btn-start');
const btnBackWelcome = document.getElementById('btn-back-welcome');
const btnBackTopicsMenu = document.getElementById('btn-back-topics-menu');
const btnBackTopics = document.getElementById('btn-back-topics');
const btnExit = document.getElementById('btn-exit');
const btnAction = document.getElementById('btn-action');

// Seletores do Painel Operacional do Quiz
const microscopeContainer = document.getElementById('microscope-container');
const microscopeScreen = document.getElementById('microscope-screen');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const feedbackPanel = document.getElementById('feedback-panel');
const feedbackStatus = document.getElementById('feedback-status');
const rationaleText = document.getElementById('rationale-text');
const topicBadge = document.getElementById('topic-badge');

// Seletores de Indicadores de Progresso
const progressText = document.getElementById('progress-text');
const scoreText = document.getElementById('score-text');
const progressBar = document.getElementById('progress-bar');

// Dicionário de Formatação de Nomes de Tópicos para exibição amigável na Badge
const nomesFormatadosTopicos = {
    "introducao": "01. Relação Parasito-Hospedeiro",
    "protozoarios_int": "02. Protozoários Intestinais",
    "nematoideos": "03. Nematódeos Médicos",
    "cestodeos": "04. Cestódeos Médicos",
    "schistosoma": "05. Esquistossomose",
    "protozoarios_tec": "06. Protozoários Teciduais",
    "vetores": "07. Vetores (Artrópodes)"
};

// Inicialização Assíncrona do Sistema
async function inicializarAplicacao() {
    try {
        const resposta = await fetch('js/questoes.json');
        if (!resposta.ok) {
            throw new Error(`Erro HTTP! status: ${resposta.status}`);
        }
        bancoQuestoesCompleto = await resposta.json();
        configurarEventosNavegacao();
    } catch (erro) {
        console.error("Falha ao carregar o banco de questões JSON:", erro);
        if (questionText) {
            questionText.innerHTML = "<span class='text-danger fw-bold'>Erro de Sintaxe no JSON! Verifique o arquivo de questões.</span>";
        }
    }
}

// Configuração de ouvintes de eventos (Cliques)
function configurarEventosNavegacao() {
    // Boas-Vindas -> Menu de Tópicos
    if (btnStart) {
        btnStart.onclick = () => {
            welcomeContainer.classList.add('d-none');
            topicsContainer.classList.remove('d-none');
        };
    }

    // Menu de Tópicos -> Boas-Vindas
    if (btnBackWelcome) {
        btnBackWelcome.onclick = () => {
            topicsContainer.classList.add('d-none');
            welcomeContainer.classList.remove('d-none');
        };
    }

    // Menu de Dificuldade -> Volta para Menu de Tópicos
    if (btnBackTopicsMenu) {
        btnBackTopicsMenu.onclick = () => {
            difficultyContainer.classList.add('d-none');
            topicsContainer.classList.remove('d-none');
        };
    }

    // Quiz (Primeira pergunta) -> Menu de Tópicos
    if (btnBackTopics) {
        btnBackTopics.onclick = () => {
            quizContainer.classList.add('d-none');
            topicsContainer.classList.remove('d-none');
            indiceAtual = 0;
            acertos = 0;
        };
    }

    // Interceptação dos botões de tópicos acadêmicos (.btn-topic)
    const botoesTopicos = document.querySelectorAll('.btn-topic');
    botoesTopicos.forEach(botao => {
        botao.onclick = () => {
            topicoSelecionadoTemporario = botao.getAttribute('data-topic');
            // Avança para a nova tela de definição de tamanho/dificuldade
            topicsContainer.classList.add('d-none');
            difficultyContainer.classList.remove('d-none');
        };
    });

    // Interceptação dos botões de quantidade/dificuldade (.btn-difficulty)
    const botoesDificuldade = document.querySelectorAll('.btn-difficulty');
    botoesDificuldade.forEach(botao => {
        botao.onclick = () => {
            const quantidadePorTopico = parseInt(botao.getAttribute('data-size'), 10);
            gerarEIniciarSimuladoRandomico(quantidadePorTopico);
        };
    });

    // Sair prematuramente durante o Quiz -> Abre Relatório Parcial
    if (btnExit) {
        btnExit.onclick = () => encerrarSimuladoPrematuro();
    }
}

// Função Utilitária: Algoritmo Fisher-Yates para embaralhar arrays de forma justa
function embaralharArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Filtra as questões por tópico, embaralha e extrai a amostra do tamanho selecionado
function gerarEIniciarSimuladoRandomico(cardsPorTopico) {
    let poolQuestoesSorteio = [];

    if (topicoSelecionadoTemporario === 'geral') {
        // Se for o simulado geral, agrupa a quantidade escolhida de cada um dos tópicos existentes
        const listaChavesTopicos = Object.keys(nomesFormatadosTopicos);
        
        listaChavesTopicos.forEach(chaveTopico => {
            let questoesDoTopico = bancoQuestoesCompleto.filter(q => q.topico === chaveTopico);
            if (questoesDoTopico.length > 0) {
                embaralharArray(questoesDoTopico);
                // Extrai o pedaço estipulado pelo nível de dificuldade para este tópico específico
                poolQuestoesSorteio = poolQuestoesSorteio.concat(questoesDoTopico.slice(0, cardsPorTopico));
            }
        });
        
        // Embaralha o montante final combinado para mesclar as matérias na tela
        embaralharArray(poolQuestoesSorteio);
    } else {
        // Se for um tópico único isolado
        poolQuestoesSorteio = bancoQuestoesCompleto.filter(q => q.topico === topicoSelecionadoTemporario);
        if (poolQuestoesSorteio.length === 0) {
            alert("Excelente escolha! Este tópico específico está agendado e as questões entrarão no próximo upload.");
            return;
        }
        embaralharArray(poolQuestoesSorteio);
        // Limita o array filtrado ao tamanho máximo escolhido na tela de dificuldade
        poolQuestoesSorteio = poolQuestoesSorteio.slice(0, cardsPorTopico);
    }

    bancoQuestoesFiltrado = poolQuestoesSorteio;

    // Reinicializa ponteiros de execução
    indiceAtual = 0;
    acertos = 0;

    // Transição visual para a arena do Quiz
    difficultyContainer.classList.add('d-none');
    quizContainer.classList.remove('d-none');

    carregarCard();
}

function carregarCard() {
    respondido = false;

    if (feedbackPanel) feedbackPanel.classList.add('d-none');
    if (btnAction) btnAction.classList.add('d-none');
    if (btnExit) btnExit.classList.remove('d-none');

    // CONTROLE DO BOTÃO VOLTAR: Visível apenas na primeira pergunta (índice 0)
    if (btnBackTopics) {
        if (indiceAtual === 0) {
            btnBackTopics.classList.remove('d-none');
        } else {
            btnBackTopics.classList.add('d-none');
        }
    }

    const questaoAtual = bancoQuestoesFiltrado[indiceAtual];

    if (topicBadge) {
        topicBadge.textContent = nomesFormatadosTopicos[questaoAtual.topico] || "SIMULADO GERAL";
    }

    if (questionText) {
        questionText.innerHTML = questaoAtual.enunciado;
    }

    if (microscopeContainer && microscopeScreen) {
        if (questaoAtual.urlImagem) {
            microscopeScreen.src = questaoAtual.urlImagem;
            microscopeContainer.classList.remove('d-none');
        } else {
            microscopeScreen.src = "images/background-parasito.png";
            microscopeContainer.classList.remove('d-none');
        }
    }

    if (optionsContainer) {
        optionsContainer.innerHTML = '';
        questaoAtual.opcoes.forEach((alternativa, idx) => {
            const botaoOpcao = document.createElement('button');
            botaoOpcao.className = 'btn btn-option p-3 text-start w-100 rounded-3';
            botaoOpcao.textContent = alternativa;
            botaoOpcao.onclick = () => avaliarRespostaUsuario(idx, botaoOpcao);
            optionsContainer.appendChild(botaoOpcao);
        });
    }

    atualizarIndicadoresProgresso();
}

function avaliarRespostaUsuario(indexSelecionado, botaoClicado) {
    if (respondido) return; 
    respondido = true;

    const questaoAtual = bancoQuestoesFiltrado[indiceAtual];
    const todosOsBotoes = optionsContainer.querySelectorAll('.btn-option');

    todosOsBotoes.forEach(btn => btn.setAttribute('disabled', 'true'));

    if (btnBackTopics) btnBackTopics.classList.add('d-none');

    if (indexSelecionado === questaoAtual.indexCorreto) {
        botaoClicado.classList.add('correct-answer');
        if (feedbackStatus) {
            feedbackStatus.textContent = "🎉 Parabéns, você ACERTOU!";
            feedbackStatus.className = "fw-bold mb-3 text-center text-success";
        }
        acertos++;
    } else {
        botaoClicado.classList.add('wrong-answer');
        if (feedbackStatus) {
            feedbackStatus.textContent = "❌ Não foi desta vez, você ERROU! Mas não desanime, continue estudando.";
            feedbackStatus.className = "fw-bold mb-3 text-center text-danger";
        }
        if (todosOsBotoes[questaoAtual.indexCorreto]) {
            todosOsBotoes[questaoAtual.indexCorreto].classList.add('correct-answer');
        }
    }

    if (rationaleText) {
        rationaleText.innerHTML = questaoAtual.justificativa;
    }
    if (feedbackPanel) feedbackPanel.classList.remove('d-none');

    if (btnAction) {
        btnAction.classList.remove('d-none');
        if (indiceAtual === bancoQuestoesFiltrado.length - 1) {
            btnAction.textContent = "Finalizar e Ver Relatório 📊";
            btnAction.onclick = () => exibirTelaDeRelatorioFinal(bancoQuestoesFiltrado.length, Math.round((acertos / bancoQuestoesFiltrado.length) * 100));
        } else {
            btnAction.textContent = "Próximo Card →";
            btnAction.onclick = () => {
                indiceAtual++;
                carregarCard();
            };
        }
    }

    atualizarIndicadoresProgresso();
}

function atualizarIndicadoresProgresso() {
    const totalQuestoes = bancoQuestoesFiltrado.length;
    const progressoAtual = indiceAtual + 1;

    if (progressText) {
        progressText.textContent = `Questão ${progressoAtual} de ${totalQuestoes}`;
    }
    if (scoreText) {
        scoreText.textContent = `Acertos: ${acertos}`;
    }
    if (progressBar) {
        const percentual = (progressoAtual / totalQuestoes) * 100;
        progressBar.style.width = `${percentual}%`;
    }
}

function encerrarSimuladoPrematuro() {
    const respondidas = respondido ? indiceAtual + 1 : indiceAtual;
    const taxaAproveitamento = respondidas > 0 ? Math.round((acertos / respondidas) * 100) : 0;

    exibirTelaDeRelatorioFinal(respondidas, taxaAproveitamento, true);
}

function exibirTelaDeRelatorioFinal(totalQuestoesAnalisadas, taxaAproveitamento, foiInterrompido = false) {
    if (microscopeContainer) microscopeContainer.classList.add('d-none');
    if (feedbackPanel) feedbackPanel.classList.add('d-none');
    if (btnAction) btnAction.classList.add('d-none');
    if (btnExit) btnExit.classList.add('d-none');
    if (btnBackTopics) btnBackTopics.classList.add('d-none');

    if (questionText) {
        questionText.innerHTML = `
            <div class="text-center py-3">
                <h4 class="fw-bold text-dark mb-3">${foiInterrompido ? 'Sessão Interrompida' : 'Treinamento Concluído'}</h4>
                <p class="text-muted small">
                    ${foiInterrompido ? 'Você optou por encerrar o treinamento antes do fim do lote de lâminas.' : 'Desempenho consolidado obtido na análise das lâminas microscópicas.'}
                </p>
                <hr class="my-4">
                <div class="row g-3 mb-4">
                    <div class="col-6 border-end">
                        <span class="text-muted small d-block">Cards Analisados</span>
                        <strong class="fs-4 text-dark">${totalQuestoesAnalisadas} / ${bancoQuestoesFiltrado.length}</strong>
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
        btnRestart.className = 'btn btn-primary p-3 rounded-pill fw-bold mt-2 w-100 shadow-sm';
        btnRestart.textContent = 'Voltar ao Menu de Tópicos 🔄';
        btnRestart.onclick = () => {
            if (quizContainer) quizContainer.classList.add('d-none');
            if (topicsContainer) topicsContainer.classList.remove('d-none');
            indiceAtual = 0;
            acertos = 0;
        };
        optionsContainer.appendChild(btnRestart);
    }
}

// Execução imediata no carregamento do script
inicializarAplicacao();