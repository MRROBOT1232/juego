// Módulo de gestión de jugadores - Optimizado
class BingoJugadores {
    constructor() {
        this.jugadores = [];
        this.numerosSeleccionadosTemp = [];
        this.setupEvents();
        this.mostrarEstadisticas();
    }

    setupEvents() {
        const eventos = [
            ['confirmar-asignacion', () => this.confirmarAsignacion()],
            ['cancelar-asignacion', () => this.cancelarAsignacion()],
            ['btn-limpiar-seleccion', () => this.limpiarSeleccion()]
        ];

        eventos.forEach(([id, handler]) => {
            const element = document.getElementById(id);
            if (element) element.addEventListener('click', handler);
        });

        const nombreInput = document.getElementById('nombre-jugador-input');
        if (nombreInput) {
            nombreInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.confirmarAsignacion();
            });
        }
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.cancelarAsignacion();
        });
        
        document.addEventListener('dblclick', (e) => {
            if (this.numerosSeleccionadosTemp.length > 0) this.mostrarPanelAsignacion();
        });
    }

    seleccionarCasilla(numero) {
        // Verificar si el número ya está ocupado
        if (this.isNumeroOcupado(numero)) {
            this.showNotification(`❌ El número ${numero} ya está ocupado`);
            return;
        }
        
        // Verificar si ya está seleccionado temporalmente
        const index = this.numerosSeleccionadosTemp.indexOf(numero);
        
        if (index > -1) {
            // Deseleccionar
            this.numerosSeleccionadosTemp.splice(index, 1);
            this.showNotification(`➖ Número ${numero} deseleccionado`);
        } else {
            // Seleccionar (máximo 10 números)
            if (this.numerosSeleccionadosTemp.length < 10) {
                this.numerosSeleccionadosTemp.push(numero);
                this.showNotification(`➕ Número ${numero} seleccionado (${this.numerosSeleccionadosTemp.length}/10)`);
            } else {
                this.showNotification('❌ Máximo 10 números por cartilla');
                return;
            }
        }
        
        // Actualizar tablero
        window.bingoTablero.updateTableroEstados();
        
        // Mostrar/ocultar botón de asignación basado en selección
        this.actualizarBotonAsignacion();
    }
    
    actualizarBotonAsignacion() {
        let botonFlotante = document.getElementById('boton-asignar-flotante');
        const indicador = document.getElementById('indicador-seleccion');
        const contador = document.getElementById('contador-seleccion');
        
        if (this.numerosSeleccionadosTemp.length > 0) {
            // Actualizar indicador superior
            if (indicador && contador) {
                const numerosOrdenados = [...this.numerosSeleccionadosTemp].sort((a, b) => a - b);
                contador.textContent = `${this.numerosSeleccionadosTemp.length} números seleccionados: ${numerosOrdenados.join(', ')}`;
                indicador.style.display = 'flex';
            }
            
            // Crear botón flotante si no existe
            if (!botonFlotante) {
                botonFlotante = document.createElement('button');
                botonFlotante.id = 'boton-asignar-flotante';
                botonFlotante.className = 'btn-asignar-flotante';
                botonFlotante.innerHTML = '✅ Asignar Jugador';
                
                botonFlotante.addEventListener('click', () => {
                    this.mostrarPanelAsignacion();
                });
                
                document.body.appendChild(botonFlotante);
            }
            
            // Actualizar texto del botón
            botonFlotante.innerHTML = `✅ Asignar ${this.numerosSeleccionadosTemp.length} casillas a jugador`;
            botonFlotante.style.display = 'block';
        } else {
            // Ocultar indicador superior
            if (indicador) {
                indicador.style.display = 'none';
            }
            
            // Ocultar botón si no hay números seleccionados
            if (botonFlotante) {
                botonFlotante.style.display = 'none';
            }
        }
    }
    
    mostrarPanelAsignacion() {
        const panel = document.getElementById('panel-asignacion');
        const numerosTexto = document.getElementById('numeros-seleccionados-texto');
        const nombreInput = document.getElementById('nombre-jugador-input');
        
        if (panel && numerosTexto) {
            const numerosOrdenados = [...this.numerosSeleccionadosTemp].sort((a, b) => a - b);
            numerosTexto.textContent = numerosOrdenados.join(', ');
            panel.style.display = 'flex';
            
            // Focus automático eliminado - el usuario puede navegar libremente
        }
    }
    
    ocultarPanelAsignacion() {
        const panel = document.getElementById('panel-asignacion');
        const nombreInput = document.getElementById('nombre-jugador-input');
        
        if (panel) {
            panel.style.display = 'none';
        }
        
        if (nombreInput) {
            nombreInput.value = '';
        }
    }
    
    confirmarAsignacion() {
        const nombreInput = document.getElementById('nombre-jugador-input');
        const nombre = nombreInput.value.trim();
        
        if (!nombre) {
            this.showNotification('❌ Debes ingresar un nombre');
            // Focus automático eliminado - el usuario puede navegar libremente
            return;
        }
        
        if (this.numerosSeleccionadosTemp.length === 0) {
            this.showNotification('❌ No hay números seleccionados');
            return;
        }
        
        // Crear el jugador
        this.agregarJugador([...this.numerosSeleccionadosTemp], nombre);
        
        // Limpiar selección
        this.limpiarSeleccion();
    }
    
    cancelarAsignacion() {
        this.limpiarSeleccion();
    }
    
    limpiarSeleccion() {
        this.numerosSeleccionadosTemp = [];
        this.ocultarPanelAsignacion();
        this.actualizarBotonAsignacion();
        window.bingoTablero.updateTableroEstados();
        this.showNotification('🔄 Selección cancelada');
    }

    mostrarEstadisticas() {
        const estadisticas = this.getEstadisticasJugadores();
        const totalOcupados = this.getTotalNumerosOcupados().length;
        
        // Buscar o crear contenedor de estadísticas
        let contenedorStats = document.getElementById('estadisticas-jugadores');
        if (!contenedorStats) {
            contenedorStats = document.createElement('div');
            contenedorStats.id = 'estadisticas-jugadores';
            contenedorStats.className = 'estadisticas-container';
            
            // Insertar después de la lista de jugadores
            const listaJugadores = document.getElementById('lista-jugadores');
            listaJugadores.parentNode.insertBefore(contenedorStats, listaJugadores.nextSibling);
        }
        
        let html = `
            <h3>📊 Estadísticas del Juego</h3>
            <div class="stats-general">
                <strong>Total de números ocupados: ${totalOcupados}</strong>
            </div>
            <div class="stats-jugadores">
        `;
        
        estadisticas.forEach(stat => {
            html += `
                <div class="stat-jugador">
                    <span class="nombre-jugador">${stat.nombre}</span>
                    <span class="cartillas-info">${stat.totalCartillas} cartilla${stat.totalCartillas !== 1 ? 's' : ''}</span>
                    <span class="numeros-info">${stat.totalNumerosOcupados} números</span>
                </div>
            `;
        });
        
        html += `</div>`;
        contenedorStats.innerHTML = html;
    }

    agregarJugador(numeros, nombre) {
        // Verificar si el jugador ya existe
        const jugadorExistente = this.jugadores.find(j => j.nombre.toLowerCase() === nombre.toLowerCase());
        
        if (jugadorExistente) {
            // Agregar nueva cartilla al jugador existente
            const cartillaIndex = jugadorExistente.cartillas ? jugadorExistente.cartillas.length : 0;
            
            if (!jugadorExistente.cartillas) {
                // Convertir estructura antigua a nueva estructura con cartillas
                jugadorExistente.cartillas = [{
                    numeros: jugadorExistente.numeros,
                    progreso: jugadorExistente.progreso,
                    completados: jugadorExistente.completados,
                    totalCompletados: jugadorExistente.totalCompletados
                }];
                // Limpiar propiedades antiguas
                delete jugadorExistente.numeros;
                delete jugadorExistente.progreso;
                delete jugadorExistente.completados;
                delete jugadorExistente.totalCompletados;
            }
            
            // Crear nueva cartilla
            const nuevaCartilla = {
                numeros: numeros,
                progreso: {},
                completados: [],
                totalCompletados: 0
            };
            
            // Calcular progreso inicial
            numeros.forEach(num => {
                nuevaCartilla.progreso[num] = window.bingoTablero.getEstadoNumero(num);
                if (nuevaCartilla.progreso[num] === 5) {
                    nuevaCartilla.completados.push(num);
                }
            });
            
            nuevaCartilla.totalCompletados = nuevaCartilla.completados.length;
            jugadorExistente.cartillas.push(nuevaCartilla);
            
            this.showNotification(`Nueva cartilla agregada a ${nombre}`);
        } else {
            // Crear jugador nuevo con estructura de cartillas
            const nuevoJugador = {
                nombre: nombre,
                cartillas: [{
                    numeros: numeros,
                    progreso: {},
                    completados: [],
                    totalCompletados: 0
                }]
            };

            // Calcular progreso inicial
            numeros.forEach(num => {
                nuevoJugador.cartillas[0].progreso[num] = window.bingoTablero.getEstadoNumero(num);
                if (nuevoJugador.cartillas[0].progreso[num] === 5) {
                    nuevoJugador.cartillas[0].completados.push(num);
                }
            });
            
            nuevoJugador.cartillas[0].totalCompletados = nuevoJugador.cartillas[0].completados.length;
            
            this.jugadores.push(nuevoJugador);
            this.showNotification(`Jugador ${nombre} registrado`);
        }
        
        // Actualizar displays
        this.updateJugadoresDisplay();
        
        // Actualizar estadísticas
        this.mostrarEstadisticas();
    }

    updateJugadoresDisplay() {
        const container = document.getElementById('lista-jugadores');
        
        if (this.jugadores.length === 0) {
            container.innerHTML = '<div class="no-jugadores">No hay jugadores registrados</div>';
            return;
        }
        
        container.innerHTML = '';
        this.jugadores.forEach((jugador, index) => {
            const card = document.createElement('div');
            card.className = 'jugador-card';
            
            // Trabajar con cartillas múltiples
            const cartillas = jugador.cartillas || [{
                numeros: jugador.numeros || [],
                progreso: jugador.progreso || {},
                completados: jugador.completados || [],
                totalCompletados: jugador.totalCompletados || 0
            }];
            
            // Actualizar progreso de todas las cartillas
            cartillas.forEach(cartilla => {
                this.actualizarProgresoCartilla(cartilla);
            });
            
            // Verificar si hay alguna cartilla ganadora
            const tieneCartillaGanadora = cartillas.some(cartilla => 
                cartilla.totalCompletados === cartilla.numeros.length && cartilla.numeros.length > 0
            );
            
            // Buscar si este jugador ya ganó un premio
            let premioGanado = null;
            if (window.bingoPremios) {
                const ganadores = window.bingoPremios.getGanadores();
                premioGanado = ganadores.find(ganador => ganador.nombre === jugador.nombre);
            }
            
            if (tieneCartillaGanadora) {
                card.classList.add('ganador');
            }
            
            // Crear display de cartillas
            let cartillasHtml = '';
            const totalCartillas = cartillas.length;
            let cartillasGanadoras = 0;
            
            cartillas.forEach((cartilla, cartillaIndex) => {
                const esGanadora = cartilla.totalCompletados === cartilla.numeros.length && cartilla.numeros.length > 0;
                if (esGanadora) cartillasGanadoras++;
                
                cartillasHtml += `
                    <div class="cartilla ${esGanadora ? 'ganadora' : ''}">
                        <div class="numeros-cartilla">${cartilla.numeros.join(', ')}</div>
                        <div class="jugador-progreso-bar">
                            <div class="progreso-fill" style="width: ${cartilla.numeros.length > 0 ? (cartilla.totalCompletados / cartilla.numeros.length) * 100 : 0}%"></div>
                        </div>
                        <div class="progreso-text">${cartilla.totalCompletados}/${cartilla.numeros.length}</div>
                    </div>
                `;
            });
            
            card.innerHTML = `
                <div class="jugador-info">
                    <span class="jugador-nombre">${jugador.nombre}</span>
                    <button class="btn-eliminar" onclick="window.bingoJugadores.eliminarJugador(${index})">❌</button>
                </div>
                <div class="cartillas-container">${cartillasHtml}</div>
                <div class="jugador-estado">
                    ${tieneCartillaGanadora ? 
                        `🏆 ¡${cartillasGanadoras} de ${totalCartillas} cartilla(s) completada(s)!` : 
                        `${totalCartillas} cartilla(s) registrada(s)`}
                </div>
                ${premioGanado ? `
                <div class="premio-ganado">
                    🎉 <strong>${premioGanado.posicion}° Premio: S/${premioGanado.premio}</strong>
                    <br><small>Ganado a las ${premioGanado.momento}</small>
                </div>
                ` : ''}
            `;
            
            container.appendChild(card);
        });
        
        // Actualizar estadísticas después de mostrar jugadores
        this.mostrarEstadisticas();
    }

    actualizarProgresoCartilla(cartilla) {
        cartilla.totalCompletados = 0;
        cartilla.completados = [];
        
        cartilla.numeros.forEach(num => {
            const estado = window.bingoTablero.getEstadoNumero(num);
            cartilla.progreso[num] = estado;
            
            // Un número está "completado" para el jugador cuando ha salido 5 veces
            if (estado === 5) {
                cartilla.completados.push(num);
                cartilla.totalCompletados++;
            }
        });
    }

    verificarGanadores(numero) {
        console.log(`🔍 VERIFICANDO GANADORES PARA NÚMERO: ${numero}`);
        const ganadoresNuevos = [];
        
        this.jugadores.forEach((jugador, jugadorIndex) => {
            // Trabajar con cartillas múltiples
            const cartillas = jugador.cartillas || [{
                numeros: jugador.numeros || [],
                progreso: jugador.progreso || {},
                completados: jugador.completados || [],
                totalCompletados: jugador.totalCompletados || 0,
                yaGano: jugador.yaGano || false // Flag para evitar duplicados
            }];
            
            cartillas.forEach((cartilla, cartillaIndex) => {
                if (!cartilla.yaGano) {
                    // Guardar el estado anterior
                    const completadosAntes = cartilla.totalCompletados || 0;
                    
                    // Actualizar progreso SIEMPRE
                    this.actualizarProgresoCartilla(cartilla);
                    
                    // Verificar si la cartilla tiene algún número completado
                    const completadosAhora = cartilla.totalCompletados;
                    const tieneAlgunCompleto = completadosAhora > 0 && cartilla.numeros.length > 0;
                    
                    console.log(`   📊 ${jugador.nombre}: ${completadosAhora} números completos de ${cartilla.numeros.length} totales`);
                    
                    // Es ganador si tiene AL MENOS UN número completado Y no había ganado antes
                    if (tieneAlgunCompleto && completadosAntes === 0) {
                        console.log(`   🏆 ¡${jugador.nombre} GANA! Tiene número(s) completado(s) con el número ${numero}`);
                        cartilla.yaGano = true; // Marcar que ya ganó para evitar duplicados
                        ganadoresNuevos.push({
                            nombre: jugador.nombre,
                            cartilla: cartillaIndex + 1,
                            numeros: cartilla.numeros,
                            numeroQueCompleto: numero
                        });
                    }
                }
            });
        });
        
        if (ganadoresNuevos.length > 0) {
            console.log(`🎉 GANADORES NUEVOS:`, ganadoresNuevos);
        }
        
        this.updateJugadoresDisplay();
        return ganadoresNuevos;
    }

    eliminarJugador(index) {
        if (confirm(`¿Estás seguro de que quieres eliminar a ${this.jugadores[index].nombre}?`)) {
            this.jugadores.splice(index, 1);
            this.updateJugadoresDisplay();
            this.showNotification('Jugador eliminado');
        }
    }

    limpiarJugadores() {
        if (this.jugadores.length > 0) {
            if (confirm('¿Estás seguro de que quieres eliminar todos los jugadores?')) {
                this.jugadores = [];
                this.updateJugadoresDisplay();
                this.showNotification('Todos los jugadores eliminados');
            }
        }
    }

    resetJugadores() {
        this.jugadores.forEach(jugador => {
            const cartillas = jugador.cartillas || [{
                numeros: jugador.numeros || [],
                progreso: {},
                completados: [],
                totalCompletados: 0,
                yaGano: false
            }];
            
            cartillas.forEach(cartilla => {
                cartilla.progreso = {};
                cartilla.completados = [];
                cartilla.totalCompletados = 0;
                cartilla.yaGano = false; // Reset del flag de ganador
                
                cartilla.numeros.forEach(num => {
                    cartilla.progreso[num] = 0;
                });
            });
        });
        
        this.updateJugadoresDisplay();
    }

    // Getters
    getJugadores() {
        return this.jugadores;
    }

    getEstadisticasJugadores() {
        return this.jugadores.map(jugador => {
            let totalCartillas = 0;
            let numerosOcupados = [];
            
            if (jugador.numeros) {
                // Estructura antigua - una cartilla
                totalCartillas = 1;
                numerosOcupados = [...jugador.numeros];
            } else if (jugador.cartillas) {
                // Estructura nueva - múltiples cartillas
                totalCartillas = jugador.cartillas.length;
                jugador.cartillas.forEach(cartilla => {
                    numerosOcupados.push(...cartilla.numeros);
                });
            }
            
            return {
                nombre: jugador.nombre,
                totalCartillas: totalCartillas,
                numerosOcupados: [...new Set(numerosOcupados)], // Sin duplicados
                totalNumerosOcupados: [...new Set(numerosOcupados)].length
            };
        });
    }

    getTotalNumerosOcupados() {
        const todosLosNumeros = [];
        this.jugadores.forEach(jugador => {
            if (jugador.numeros) {
                todosLosNumeros.push(...jugador.numeros);
            } else if (jugador.cartillas) {
                jugador.cartillas.forEach(cartilla => {
                    todosLosNumeros.push(...cartilla.numeros);
                });
            }
        });
        return [...new Set(todosLosNumeros)]; // Sin duplicados
    }

    isNumeroOcupado(numero) {
        return this.jugadores.some(j => {
            if (j.numeros && j.numeros.includes(numero)) return true;
            if (j.cartillas && j.cartillas.some(cartilla => cartilla.numeros.includes(numero))) return true;
            return false;
        });
    }

    showNotification(mensaje) {
        // Eliminar notificación existente si la hay
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Crear nueva notificación
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = mensaje;
        
        // Agregar al DOM
        document.body.appendChild(notification);
        
        // Eliminar después de 3 segundos
        setTimeout(() => {
            if (notification && notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
}

// Instancia global de jugadores
window.bingoJugadores = new BingoJugadores();
