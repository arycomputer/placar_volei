   let pontosA = 0;
        let pontosB = 0;
        let jogoEncerrado = false;
        let vozMasculina = null;
        let vozFeminina = null;

        function carregarVozes() {
            const vozesDisponiveis = speechSynthesis.getVoices();
            vozMasculina = vozesDisponiveis.find(v => v.lang === 'pt-BR' && v.name.toLowerCase().includes('ricardo'))
                || vozesDisponiveis.find(v => v.lang === 'pt-BR' && v.gender !== 'female'); // fallback
            vozFeminina = vozesDisponiveis.find(v => v.lang === 'pt-BR' && v.name.toLowerCase().includes('luciana'))
                || vozesDisponiveis.find(v => v.lang === 'pt-BR' && v.gender !== 'male'); // fallback
        }

        // Carregar vozes (pode demorar um pouquinho)
        speechSynthesis.onvoiceschanged = carregarVozes;

        function alterarPlacar(time, valor) {
            if (jogoEncerrado) return;

            if (time === 'A') {
                pontosA = Math.max(0, pontosA + valor);
                document.getElementById('pontosA').textContent = pontosA;

                if (valor > 0) {
                    falar(`Ponto para ${document.getElementById('nomeA').value}`, 'A');
                } else {
                    falar(`Removido ponto do ${document.getElementById('nomeA').value}`, 'A');
                }

            } else {
                pontosB = Math.max(0, pontosB + valor);
                document.getElementById('pontosB').textContent = pontosB;

                if (valor > 0) {
                    falar(`Ponto para ${document.getElementById('nomeB').value}`, 'B');
                } else {
                    falar(`Removido ponto do ${document.getElementById('nomeB').value}`, 'B');
                }
            }

            verificarFimDeJogo();
        }

        function verificarFimDeJogo() {
            const limite = parseInt(document.getElementById('limitePontos').value) || 0;
            const diff = Math.abs(pontosA - pontosB);

            if ((pontosA >= limite || pontosB >= limite) && diff >= 2) {
                jogoEncerrado = true;

                const vencedor = pontosA > pontosB
                    ? document.getElementById('nomeA').value
                    : document.getElementById('nomeB').value;

                document.getElementById('mensagemFinal').textContent = `🏆 ${vencedor} venceu o jogo!`;
                falar(`${vencedor} venceu o jogo!`, pontosA > pontosB ? 'A' : 'B');
                desativarBotoes();
            }
        }

        function desativarBotoes() {
            document.querySelectorAll("button").forEach(btn => {
                if (!btn.classList.contains('resetar')) {
                    btn.disabled = true;
                }
            });
        }

        function resetarPlacar() {
            pontosA = 0;
            pontosB = 0;
            jogoEncerrado = false;
            document.getElementById('pontosA').textContent = pontosA;
            document.getElementById('pontosB').textContent = pontosB;
            document.getElementById('mensagemFinal').textContent = '';
            document.querySelectorAll("button").forEach(btn => btn.disabled = false);
        }

        function alternarTema() {
            document.body.classList.toggle('dark');
        }

        // 🎙️ Comando de voz
        window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (window.SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.lang = 'pt-BR';
            recognition.continuous = true;
            recognition.interimResults = false;

            recognition.onresult = (event) => {
                const comando = event.results[event.results.length - 1][0].transcript.toLowerCase();
                interpretarComando(comando);
            };

            recognition.onstart = () => {
                document.getElementById('vozStatus').textContent = '🎤 Ouvindo...';
            };

            recognition.onend = () => {
                document.getElementById('vozStatus').textContent = '🎙️ Aguardando comandos de voz...';
                recognition.start(); // reinicia automaticamente
            };

            recognition.start();

            function interpretarComando(fala) {
                if (fala.includes('ponto time a') || fala.includes('time a mais um')) {
                    alterarPlacar('A', 1);
                } else if (fala.includes('ponto time b') || fala.includes('time b mais um')) {
                    alterarPlacar('B', 1);
                } else if (fala.includes('remover ponto time a')) {
                    alterarPlacar('A', -1);
                } else if (fala.includes('remover ponto time b')) {
                    alterarPlacar('B', -1);
                } else if (fala.includes('resetar') || fala.includes('zerar placar')) {
                    resetarPlacar();
                }
            }
        } else {
            document.getElementById('vozStatus').textContent = '❌ Comando de voz não suportado neste navegador.';
        }

        function falar(texto, time = 'A') {
            const utterance = new SpeechSynthesisUtterance(texto);
            utterance.lang = 'pt-BR';

            if (time === 'A' && vozMasculina) {
                utterance.voice = vozMasculina;
            } else if (time === 'B' && vozFeminina) {
                utterance.voice = vozFeminina;
            }

            speechSynthesis.speak(utterance);
        }
