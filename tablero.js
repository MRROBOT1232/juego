// Módulo de gestión del tablero
class BingoTablero {
    constructor() {
        this.numeros = {};
        this.numerosDisponibles = [];
        this.totalNumeros = window.bingoConfig.getTotalNumeros();
        this.initializeTablero();
    }

    initializeTablero() {
        // Inicializar todos los números
        this.numeros = {};
        for (let i = 1; i <= this.totalNumeros; i++) {
            this.numeros[i] = 0; // 0 = no ha salido, máximo 5
        }
        
        // Llenar array de números disponibles (cada número aparece 5 veces)
        this.numerosDisponibles = [];
        for (let i = 1; i <= this.totalNumeros; i++) {
            for (let j = 0; j < 5; j++) {
                this.numerosDisponibles.push(i);
            }
        }
        
        // Mezclar el array
        this.shuffleArray(this.numerosDisponibles);
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    createTableroHTML() {
        const tablero = document.getElementById('tablero');
        tablero.innerHTML = '';

        // Siempre usar cuadrícula 5x5 (CSS maneja esto)
        for (let i = 1; i <= this.totalNumeros; i++) {
            const card = document.createElement('div');
            card.className = 'numero-card';
            card.id = `numero-${i}`;

            const title = document.createElement('div');
            title.className = 'numero-title';
            title.textContent = i;

            const circulos = document.createElement('div');
            circulos.className = 'circulos';

            // Crear 5 círculos para cada número
            for (let j = 0; j < 5; j++) {
                const circulo = document.createElement('div');
                circulo.className = 'circulo';
                circulo.id = `circulo-${i}-${j}`;
                circulos.appendChild(circulo);
            }

            card.appendChild(title);
            card.appendChild(circulos);
            
            // Agregar evento de clic para selección
            card.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Usar la nueva función de selección
                window.bingoJugadores.seleccionarCasilla(i);
            });
            
            tablero.appendChild(card);
        }
        
        this.updateTableroEstados();
    }

    calcularColumnas() {
        // Siempre usar cuadrícula 5x5
        return 5;
    }

    aplicarConfiguracion(nuevoTotal) {
        if (nuevoTotal !== this.totalNumeros) {
            this.totalNumeros = nuevoTotal;
            window.bingoConfig.setTotalNumeros(nuevoTotal);
            this.initializeTablero();
            this.createTableroHTML();
            
            // Limpiar jugadores ya que el tablero cambió
            window.bingoJugadores.limpiarJugadores();
            
            return true;
        }
        return false;
    }

    updateTableroEstados() {
        const jugadores = window.bingoJugadores.getJugadores();
        const numerosSeleccionados = window.bingoJugadores.numerosSeleccionadosTemp || [];

        for (let i = 1; i <= this.totalNumeros; i++) {
            const card = document.getElementById(`numero-${i}`);
            if (!card) continue;

            // Usar el nuevo método de verificación
            const estaOcupado = window.bingoJugadores.isNumeroOcupado(i);
            let jugadorConNumero = null;
            
            if (estaOcupado) {
                // Encontrar el jugador específico para mostrar su nombre
                jugadorConNumero = jugadores.find(j => {
                    if (j.numeros && j.numeros.includes(i)) return true;
                    if (j.cartillas && j.cartillas.some(cartilla => cartilla.numeros.includes(i))) return true;
                    return false;
                });
            }
            
            // Limpiar clases
            card.classList.remove('seleccionable', 'ocupado', 'completado', 'seleccionado-temp');
            
            // Remover nombre del jugador si existe
            const nombreExistente = card.querySelector('.jugador-nombre-card');
            if (nombreExistente) {
                nombreExistente.remove();
            }
            
            if (this.numeros[i] === 5) {
                // Número completado (salió 5 veces)
                card.classList.add('completado');
            } else if (estaOcupado && jugadorConNumero) {
                // Número ocupado por un jugador
                card.classList.add('ocupado');
                const nombreDiv = document.createElement('div');
                nombreDiv.className = 'jugador-nombre-card';
                nombreDiv.textContent = jugadorConNumero.nombre;
                card.appendChild(nombreDiv);
            } else if (numerosSeleccionados.includes(i)) {
                // Número seleccionado temporalmente
                card.classList.add('seleccionado-temp');
            } else {
                // Número libre para seleccionar
                card.classList.add('seleccionable');
            }
        }
    }

    sacarNumero() {
        if (this.numerosDisponibles.length === 0) {
            return null;
        }

        const index = Math.floor(Math.random() * this.numerosDisponibles.length);
        const numero = this.numerosDisponibles.splice(index, 1)[0];

        this.numeros[numero]++;
        
        return numero;
    }

    updateTableroNumero(numero) {
        const cantidadVeces = this.numeros[numero];
        const circulo = document.getElementById(`circulo-${numero}-${cantidadVeces - 1}`);
        
        if (circulo) {
            circulo.classList.add('marcado');
        }

        // Si el número está completo, marcarlo
        if (this.numeros[numero] === 5) {
            this.marcarNumeroCompleto(numero);
        }
    }

    marcarNumeroCompleto(numero) {
        const card = document.getElementById(`numero-${numero}`);
        if (card && this.numeros[numero] === 5) {
            card.classList.add('completado');
        }
        return this.numeros[numero] === 5;
    }

    getNumerosSacados() {
        return Object.keys(this.numeros).filter(num => this.numeros[num] > 0).length;
    }

    getNumerosCompletados() {
        return Object.values(this.numeros).filter(count => count === 5).length;
    }

    getNumerosDisponibles() {
        return this.numerosDisponibles.length;
    }

    getEstadoNumero(numero) {
        return this.numeros[numero] || 0;
    }

    resetTablero() {
        this.initializeTablero();
        this.createTableroHTML();
    }

    getTotalNumeros() {
        return this.totalNumeros;
    }
}

// Instancia global del tablero
window.bingoTablero = new BingoTablero();
