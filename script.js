// Script principal del Bingo Especial - Optimizado
class BingoEspecial {
    constructor() {
        this.historial = [];
        this.ultimoNumero = null;
        this.intervaloTiempo = 3000;
        this.numerosGanadores = {};
        this.modoAutomatico = false;
        this.intervaloAutomatico = null;
        this.estadoAutomatico = 'detenido'; // 'detenido', 'iniciado', 'pausado'
        
        this.initializeGame();
        this.bindEvents();
    }

    initializeGame() {
        window.bingoTablero.createTableroHTML();
        window.bingoJugadores.updateJugadoresDisplay();
        window.bingoPremios.updatePremiosDisplay();
        this.updateStats();
    }

    sacarNumero() {
        // Verificar si todos los premios ya han sido entregados
        if (window.bingoPremios?.getEstadisticas().premiosRestantes === 0) {
            this.showNotification('🎉 ¡Todos los premios han sido entregados!', 'completado');
            return;
        }
        
        const numero = window.bingoTablero.sacarNumero();
        if (!numero) {
            this.showNotification('¡Todos los números han sido completados!');
            this.detenerModoAutomatico();
            return;
        }

        if (this.historial.length === 0) this.activarModoJuego();

        this.historial.push(numero);
        this.ultimoNumero = numero;

        window.bingoAudio.reproducirSonidoBolilla();
        this.animarTitulo();

        this.updateNumeroDisplay(numero);
        window.bingoTablero.updateTableroNumero(numero);
        this.updateHistorial();
        this.updateStats();

        if (window.bingoTablero.marcarNumeroCompleto(numero)) {
            setTimeout(() => {
                this.showNotification(`🎉 ¡NÚMERO ${numero} COMPLETADO! 🎉`, 'completado');
                window.bingoAudio.reproducirSonidoFestejo();
            }, 500);
        }
        
        this.procesarGanadores(numero);
        window.bingoJugadores.updateJugadoresDisplay();
    }

    procesarGanadores(numero) {
        const ganadoresNuevos = window.bingoJugadores.verificarGanadores(numero);
        
        ganadoresNuevos.forEach((jugadorInfo, index) => {
            const jugadorParaPremio = {
                ...jugadorInfo,
                timestamp: Date.now() + index
            };
            
            const ganador = window.bingoPremios.registrarGanador(jugadorParaPremio, numero);
            
            if (ganador) {
                this.numerosGanadores[ganador.posicion] = {
                    numero,
                    jugador: ganador.nombre,
                    premio: ganador.premio,
                    posicion: ganador.posicion
                };
                
                setTimeout(() => {
                    this.actualizarTableroConPremios();
                    this.showNotification(
                        `🏆 ¡${ganador.nombre} ha ganado el ${ganador.posicion}° lugar! Premio: S/${ganador.premio}`, 
                        'ganador'
                    );
                    
                    if (window.bingoPremios.getEstadisticas().premiosRestantes === 0) {
                        this.detenerModoAutomatico();
                        document.getElementById('sacar-numero').disabled = true;
                        this.showNotification('🎉 ¡Todos los premios han sido entregados! Juego pausado.', 'completado');
                    }
                }, 1500);
            }
        });

        if (ganadoresNuevos.length > 0) {
            setTimeout(() => this.actualizarTableroConPremios(), 500);
        }
    }

    actualizarTableroConPremios() {
        document.querySelectorAll('.premio-info').forEach(el => el.remove());
        
        Object.values(this.numerosGanadores).forEach(ganadorInfo => {
            const card = document.getElementById(`numero-${ganadorInfo.numero}`);
            if (!card || window.bingoTablero.getEstadoNumero(ganadorInfo.numero) !== 5) return;
            
            const premioElement = document.createElement('div');
            premioElement.className = 'premio-info';
            premioElement.style.cssText = `
                position: absolute; bottom: 2px; left: 2px; right: 2px;
                background: linear-gradient(135deg, #ffd700, #ffed4e);
                color: #333; padding: 4px 2px; border-radius: 4px;
                font-size: 0.65em; text-align: center;
                border: 2px solid #ffc107; box-shadow: 0 2px 6px rgba(0,0,0,0.3); z-index: 5;
            `;
            
            const ordinales = {1: '1ro', 2: '2do', 3: '3ro', 4: '4to', 5: '5to', 6: '6to', 7: '7mo', 8: '8vo', 9: '9no', 10: '10mo'};
            const posicionTexto = ordinales[ganadorInfo.posicion] || `${ganadorInfo.posicion}°`;
            
            premioElement.innerHTML = `
                <div style="font-weight: bold; font-size: 1.2em; color: #d4a017;">${posicionTexto}</div>
                <div style="font-weight: bold; color: #b8860b; font-size: 1.1em;">S/${ganadorInfo.premio}</div>
                <div style="font-size: 0.85em; color: #8b6914; font-weight: 600;">${ganadorInfo.jugador}</div>
            `;
            
            card.appendChild(premioElement);
        });
    }

    aplicarConfiguracionTablero() {
        const input = document.getElementById('total-numeros');
        const nuevoTotal = parseInt(input.value);
        
        if (isNaN(nuevoTotal) || nuevoTotal < 5 || nuevoTotal > 50) {
            this.showNotification('El número debe estar entre 5 y 50');
            input.value = window.bingoConfig.getTotalNumeros();
            return;
        }
        
        if (nuevoTotal % 5 !== 0) {
            const valorAjustado = Math.round(nuevoTotal / 5) * 5;
            if (confirm(`¿Ajustar a ${valorAjustado} números para mejor distribución?`)) {
                input.value = valorAjustado;
                this.aplicarConfiguracionTablero();
                return;
            } else {
                input.value = window.bingoConfig.getTotalNumeros();
                return;
            }
        }
        
        if (window.bingoTablero.aplicarConfiguracion(nuevoTotal)) {
            this.resetGame(false);
            this.showNotification(`Tablero actualizado a ${nuevoTotal} números`);
        }
    }

    updateNumeroDisplay(numero) {
        const display = document.getElementById('numero-actual');
        display.textContent = numero;
        display.style.animation = 'none';
        setTimeout(() => display.style.animation = 'pulse 2s infinite', 10);
    }

    updateHistorial() {
        const historialContainer = document.getElementById('historial-numeros');
        
        if (this.historial.length === 1) {
            historialContainer.innerHTML = '';
        }
        
        if (this.historial.length > 0) {
            const ultimoNumero = this.historial[this.historial.length - 1];
            const numeroEsperado = historialContainer.children.length;
            const numeroActual = this.historial.length - 1;
                
            if (numeroActual >= numeroEsperado) {
                historialContainer.querySelectorAll('.numero-historial.ultimo').forEach(num => num.classList.remove('ultimo'));
                
                const span = document.createElement('span');
                span.className = 'numero-historial ultimo';
                span.textContent = ultimoNumero;
                
                setTimeout(() => {
                    historialContainer.appendChild(span);
                    
                    const todosLosNumeros = historialContainer.children;
                    if (todosLosNumeros.length > 30) {
                        const numeroAEliminar = todosLosNumeros[0];
                        numeroAEliminar.style.animation = 'desaparecer 0.5s ease-in forwards';
                        setTimeout(() => numeroAEliminar.parentNode && numeroAEliminar.remove(), 500);
                    }
                }, 200);
            }
        }
    }

    updateStats() {
        document.getElementById('count-numeros').textContent = this.historial.length;
        document.getElementById('count-completados').textContent = window.bingoTablero.getNumerosCompletados();

        const juegoTerminado = window.bingoPremios?.getEstadisticas().premiosRestantes === 0;
        document.getElementById('sacar-numero').disabled = 
            window.bingoTablero.getNumerosDisponibles() === 0 || this.modoAutomatico || juegoTerminado;
    }

    activarModoJuego() {
        document.getElementById('tablero').classList.add('juego-iniciado');
        this.showNotification('🎮 ¡Juego iniciado!');
    }

    animarTitulo() {
        const titulo = document.querySelector('h1');
        titulo.classList.add('numero-sacado');
        this.crearConfeti();
        setTimeout(() => titulo.classList.remove('numero-sacado'), 1000);
    }

    crearConfeti() {
        const colores = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#6BCF7F', '#FF8A80', '#80D8FF'];
        
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const confeti = document.createElement('div');
                confeti.className = 'confeti';
                confeti.style.backgroundColor = colores[Math.floor(Math.random() * colores.length)];
                confeti.style.left = Math.random() * 100 + '%';
                confeti.style.animationDelay = Math.random() * 0.5 + 's';
                confeti.style.animationDuration = (Math.random() * 2 + 1) + 's';
                
                document.body.appendChild(confeti);
                setTimeout(() => confeti.parentNode && confeti.remove(), 3000);
            }, i * 20);
        }
    }

    resetGame(confirmar = true) {
        if (confirmar && !confirm('¿Estás seguro de que quieres iniciar un nuevo juego?')) return;

        this.detenerModoAutomatico();

        window.bingoTablero.resetTablero();
        window.bingoJugadores.resetJugadores();
        window.bingoPremios.resetPremios();
        
        this.historial = [];
        this.ultimoNumero = null;
        this.numerosGanadores = {};
        
        document.getElementById('numero-actual').textContent = '-';
        document.getElementById('historial-numeros').innerHTML = '';
        document.querySelectorAll('.premio-info').forEach(el => el.remove());
        document.getElementById('tablero').classList.remove('juego-iniciado');
        
        this.updateStats();
    }

    // Modo Automático
    toggleModoAutomatico() {
        const panel = document.getElementById('controles-automatico');
        const btn = document.getElementById('modo-automatico-btn');
        
        if (panel.style.display === 'none') {
            panel.style.display = 'flex';
            btn.classList.add('activo');
        } else {
            panel.style.display = 'none';
            btn.classList.remove('activo');
            this.detenerModoAutomatico();
        }
    }

    iniciarPausarAutomatico() {
        const btn = document.getElementById('iniciar-pausar-auto');
        
        if (this.estadoAutomatico === 'detenido') {
            this.iniciarModoAutomatico();
        } else if (this.estadoAutomatico === 'iniciado') {
            this.pausarModoAutomatico();
        } else if (this.estadoAutomatico === 'pausado') {
            this.reanudarModoAutomatico();
        }
    }

    iniciarModoAutomatico() {
        const segundos = parseInt(document.getElementById('intervalo-segundos').value);
        this.intervaloTiempo = segundos * 1000;
        this.modoAutomatico = true;
        this.estadoAutomatico = 'iniciado';
        
        const btn = document.getElementById('iniciar-pausar-auto');
        btn.textContent = '⏸️ Pausar';
        btn.classList.remove('pausado');
        
        document.getElementById('sacar-numero').disabled = true;
        
        this.intervaloAutomatico = setInterval(() => this.sacarNumero(), this.intervaloTiempo);
        this.showNotification(`Modo automático iniciado - cada ${segundos} segundos`);
    }

    pausarModoAutomatico() {
        if (this.intervaloAutomatico) {
            clearInterval(this.intervaloAutomatico);
            this.intervaloAutomatico = null;
        }
        
        this.estadoAutomatico = 'pausado';
        const btn = document.getElementById('iniciar-pausar-auto');
        btn.textContent = '▶️ Reanudar';
        btn.classList.add('pausado');
        
        this.showNotification('Modo automático pausado');
    }

    reanudarModoAutomatico() {
        this.estadoAutomatico = 'iniciado';
        const btn = document.getElementById('iniciar-pausar-auto');
        btn.textContent = '⏸️ Pausar';
        btn.classList.remove('pausado');
        
        this.intervaloAutomatico = setInterval(() => this.sacarNumero(), this.intervaloTiempo);
        this.showNotification('Modo automático reanudado');
    }

    detenerModoAutomatico() {
        if (this.intervaloAutomatico) {
            clearInterval(this.intervaloAutomatico);
            this.intervaloAutomatico = null;
        }
        
        this.modoAutomatico = false;
        this.estadoAutomatico = 'detenido';
        
        const btn = document.getElementById('iniciar-pausar-auto');
        btn.textContent = '▶️ Iniciar';
        btn.classList.remove('pausado');
        
        document.getElementById('sacar-numero').disabled = false;
        this.updateStats();
        
        if (this.estadoAutomatico !== 'detenido') {
            this.showNotification('Modo automático detenido');
        }
    }

    mostrarUltimoNumero() {
        const mensaje = this.ultimoNumero ? `Último número: ${this.ultimoNumero}` : 'Aún no se ha sacado ningún número';
        this.showNotification(mensaje);
    }

    showNotification(message, tipo = 'normal') {
        const notification = document.createElement('div');
        
        const estilos = {
            normal: { bg: 'linear-gradient(45deg, #4CAF50, #45a049)', size: '1.2em', padding: '15px 30px' },
            ganador: { bg: 'linear-gradient(45deg, #FFD700, #FFA500)', size: '1.2em', padding: '15px 30px' },
            completado: { bg: 'linear-gradient(45deg, #FF6B6B, #ee5a52)', size: '1.5em', padding: '20px 40px' }
        };
        
        const estilo = estilos[tipo] || estilos.normal;
        
        notification.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: ${estilo.bg}; color: white; padding: ${estilo.padding};
            border-radius: 20px; font-size: ${estilo.size}; font-weight: bold; z-index: 1000;
            box-shadow: 0 8px 25px rgba(0,0,0,0.3); animation: slideIn 0.5s ease-in-out;
            text-align: center; max-width: 90%; border: 3px solid white;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), tipo === 'ganador' ? 4000 : 2500);
    }

    bindEvents() {
        // Botones principales
        const eventos = [
            ['sacar-numero', () => this.sacarNumero()],
            ['reset-game', () => this.resetGame()],
            ['ultimo-numero', () => this.mostrarUltimoNumero()],
            ['aplicar-config', () => this.aplicarConfiguracionTablero()],
            ['modo-automatico-btn', () => this.toggleModoAutomatico()],
            ['iniciar-pausar-auto', () => this.iniciarPausarAutomatico()],
            ['detener-auto', () => this.detenerModoAutomatico()]
        ];

        eventos.forEach(([id, handler]) => {
            const element = document.getElementById(id);
            if (element) element.addEventListener('click', handler);
        });

        // Atajos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
            
            const acciones = {
                ' ': () => !document.getElementById('sacar-numero').disabled && !this.modoAutomatico && this.sacarNumero(),
                'Enter': () => !document.getElementById('sacar-numero').disabled && !this.modoAutomatico && this.sacarNumero(),
                'u': () => this.mostrarUltimoNumero(),
                'U': () => this.mostrarUltimoNumero(),
                'a': () => this.toggleModoAutomatico(),
                'A': () => this.toggleModoAutomatico()
            };

            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                this.resetGame();
            } else if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                window.bingoPDF.exportarPDF();
            } else if (acciones[e.key]) {
                e.preventDefault();
                acciones[e.key]();
            }
        });

        // Responsive
        window.addEventListener('resize', () => {
            setTimeout(() => window.bingoTablero.updateTableroEstados(), 100);
        });
    }

    getHistorial() { return [...this.historial]; }
    getUltimoNumero() { return this.ultimoNumero; }
}

// Estilos para animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
`;
document.head.appendChild(style);

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    window.bingoGame = new BingoEspecial();
});
