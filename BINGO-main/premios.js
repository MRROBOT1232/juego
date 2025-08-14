// Módulo de gestión de premios
class BingoPremios {
    constructor() {
        this.premios = window.bingoConfig.getPremiosDefecto();
        this.cantidadPremios = window.bingoConfig.getCantidadPremios();
        this.ganadores = [];
        this.setupEvents();
        this.generarInputsPremios();
        this.updatePremiosDisplay();
    }

    setupEvents() {
        document.getElementById('cantidad-premios').addEventListener('change', (e) => {
            this.cambiarCantidadPremios(parseInt(e.target.value));
        });

        document.getElementById('actualizar-premios').addEventListener('click', () => {
            this.actualizarPremios();
        });
    }

    cambiarCantidadPremios(nuevaCantidad) {
        this.cantidadPremios = nuevaCantidad;
        window.bingoConfig.setCantidadPremios(nuevaCantidad);
        
        // Ajustar array de premios
        while (this.premios.length < nuevaCantidad) {
            // Agregar premios con valores decrecientes
            const ultimoPremio = this.premios[this.premios.length - 1] || 50;
            const nuevoPremio = Math.max(ultimoPremio - 50, 25);
            this.premios.push(nuevoPremio);
        }
        
        if (this.premios.length > nuevaCantidad) {
            this.premios = this.premios.slice(0, nuevaCantidad);
        }
        
        this.generarInputsPremios();
        this.updatePremiosDisplay();
    }

    generarInputsPremios() {
        const container = document.getElementById('premios-inputs');
        container.innerHTML = '';
        
        const posiciones = ['1er', '2do', '3er', '4to', '5to', '6to', '7mo', '8vo', '9no', '10mo'];
        
        for (let i = 0; i < this.cantidadPremios; i++) {
            const div = document.createElement('div');
            div.className = 'premio-input-row';
            
            const label = document.createElement('label');
            label.innerHTML = `${posiciones[i]} Premio: S/<input type="number" id="premio-${i + 1}" value="${this.premios[i]}" min="1">`;
            
            div.appendChild(label);
            container.appendChild(div);
        }
    }

    actualizarPremios() {
        const premiosAnteriores = [...this.premios];
        
        for (let i = 1; i <= this.cantidadPremios; i++) {
            const input = document.getElementById(`premio-${i}`);
            const valor = parseInt(input.value);
            
            if (valor < 1) {
                this.showNotification(`El valor del ${i}° premio debe ser mayor a 0`);
                return;
            }
            
            this.premios[i - 1] = valor;
        }
        
        this.updatePremiosDisplay();
        this.showNotification('Premios actualizados correctamente');
    }

    updatePremiosDisplay() {
        const container = document.getElementById('premios-lista');
        container.innerHTML = '';
        
        const posiciones = ['1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°', '10°'];
        
        for (let i = 0; i < this.cantidadPremios; i++) {
            const div = document.createElement('div');
            div.className = 'premio-item';
            
            const ganador = this.ganadores[i];
            if (ganador) {
                div.classList.add('premio-ganado');
                div.innerHTML = `
                    <span class="premio-posicion">${posiciones[i]} Premio: S/${this.premios[i]}</span>
                    <span class="premio-ganador">🏆 ${ganador.nombre}</span>
                `;
            } else {
                div.textContent = `${posiciones[i]} Premio: S/${this.premios[i]}`;
            }
            
            container.appendChild(div);
        }
    }

    registrarGanador(jugador, numero) {
        const posicion = this.ganadores.length + 1;
        
        if (posicion <= this.cantidadPremios) {
            const ganador = {
                nombre: jugador.nombre, // Usar el nombre del jugador que realmente ganó
                cartilla: jugador.cartilla,
                numeros: jugador.numeros,
                numeroQueCompleto: jugador.numeroQueCompleto,
                posicion: posicion,
                premio: this.premios[posicion - 1],
                numero: numero,
                momento: new Date().toLocaleTimeString(),
                fecha: new Date().toLocaleDateString()
            };
            
            console.log(`🏆 REGISTRANDO GANADOR:`, ganador);
            
            this.ganadores.push(ganador);
            this.updatePremiosDisplay();
            
            // Anunciar ganador con voz
            setTimeout(() => {
                window.bingoAudio.anunciarGanador(
                    ganador.nombre, 
                    numero, 
                    this.obtenerTextoOrdinal(posicion),
                    ganador.premio
                );
            }, 1000);
            
            return ganador;
        }
        
        return null;
    }

    obtenerTextoOrdinal(numero) {
        const ordinales = {
            1: 'primer',
            2: 'segundo', 
            3: 'tercer',
            4: 'cuarto',
            5: 'quinto',
            6: 'sexto',
            7: 'séptimo',
            8: 'octavo',
            9: 'noveno',
            10: 'décimo'
        };
        
        return ordinales[numero] || `${numero}°`;
    }

    obtenerResumenPremios() {
        return {
            configuracion: this.premios.map((premio, index) => ({
                posicion: index + 1,
                valor: premio
            })),
            ganadores: this.ganadores,
            totalEntregado: this.ganadores.reduce((total, ganador) => total + ganador.premio, 0),
            premiosRestantes: this.cantidadPremios - this.ganadores.length
        };
    }

    resetPremios() {
        this.ganadores = [];
        this.updatePremiosDisplay();
    }

    // Getters
    getPremios() {
        return [...this.premios];
    }

    getGanadores() {
        return [...this.ganadores];
    }

    getEstadisticas() {
        return {
            configuracion: this.premios.map((premio, index) => ({
                posicion: index + 1,
                valor: premio
            })),
            ganadores: this.ganadores,
            totalEntregado: this.ganadores.reduce((total, ganador) => total + ganador.premio, 0),
            premiosRestantes: this.cantidadPremios - this.ganadores.length
        };
    }

    getCantidadPremios() {
        return this.cantidadPremios;
    }

    getPremioDisponible() {
        const posicion = this.ganadores.length;
        return posicion < this.cantidadPremios ? this.premios[posicion] : 0;
    }

    showNotification(message, tipo = 'normal') {
        if (window.bingoGame && window.bingoGame.showNotification) {
            window.bingoGame.showNotification(message, tipo);
        } else {
            alert(message);
        }
    }
}

// Instancia global de premios
window.bingoPremios = new BingoPremios();
