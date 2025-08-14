// Módulo de exportación PDF
class BingoPDF {
    constructor() {
        this.setupEvents();
    }

    setupEvents() {
        document.getElementById('exportar-pdf').addEventListener('click', () => {
            this.exportarPDF();
        });
    }

    async exportarPDF() {
        try {
            this.showNotification('Generando PDF...', 'normal');
            
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Configuración inicial
            doc.setFont('helvetica');
            let yPosition = 20;
            
            // Título
            doc.setFontSize(20);
            doc.setTextColor(0, 0, 0);
            doc.text('REPORTE DE BINGO DE LA ESPECIAL', 105, yPosition, { align: 'center' });
            yPosition += 15;
            
            // Fecha y hora
            doc.setFontSize(12);
            doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, yPosition);
            doc.text(`Hora: ${new Date().toLocaleTimeString()}`, 120, yPosition);
            yPosition += 20;
            
            // Configuración del juego
            yPosition = this.agregarConfiguracionJuego(doc, yPosition);
            
            // Estadísticas generales
            yPosition = this.agregarEstadisticas(doc, yPosition);
            
            // Ganadores
            yPosition = this.agregarGanadores(doc, yPosition);
            
            // Jugadores registrados
            yPosition = this.agregarJugadores(doc, yPosition);
            
            // Historial de números
            yPosition = this.agregarHistorial(doc, yPosition);
            
            // Configuración de premios
            yPosition = this.agregarConfiguracionPremios(doc, yPosition);
            
            // Guardar PDF
            const fileName = `bingo_${new Date().toISOString().split('T')[0]}_${new Date().toLocaleTimeString().replace(/:/g, '-')}.pdf`;
            doc.save(fileName);
            
            this.showNotification('PDF exportado exitosamente', 'ganador');
            
        } catch (error) {
            console.error('Error al generar PDF:', error);
            this.showNotification('Error al generar el PDF', 'normal');
        }
    }

    agregarConfiguracionJuego(doc, yPosition) {
        doc.setFontSize(14);
        doc.setTextColor(128, 0, 128);
        doc.text('CONFIGURACIÓN DEL JUEGO', 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`• Total de números en el tablero: ${window.bingoTablero.getTotalNumeros()}`, 25, yPosition);
        yPosition += 8;
        doc.text(`• Cantidad de premios configurados: ${window.bingoPremios.getCantidadPremios()}`, 25, yPosition);
        yPosition += 8;
        doc.text(`• Jugadores registrados: ${window.bingoJugadores.getJugadores().length}`, 25, yPosition);
        yPosition += 15;
        
        return yPosition;
    }

    agregarEstadisticas(doc, yPosition) {
        const historial = window.bingoGame.getHistorial();
        
        doc.setFontSize(14);
        doc.setTextColor(0, 100, 0);
        doc.text('ESTADÍSTICAS GENERALES', 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`• Total de números sacados: ${historial.length}`, 25, yPosition);
        yPosition += 8;
        doc.text(`• Números completados (5 veces): ${window.bingoTablero.getNumerosCompletados()}`, 25, yPosition);
        yPosition += 8;
        doc.text(`• Números restantes por sacar: ${window.bingoTablero.getNumerosDisponibles()}`, 25, yPosition);
        yPosition += 8;
        doc.text(`• Ganadores registrados: ${window.bingoPremios.getGanadores().length}`, 25, yPosition);
        yPosition += 15;
        
        return yPosition;
    }

    agregarGanadores(doc, yPosition) {
        const ganadores = window.bingoPremios.getGanadores();
        
        if (ganadores.length > 0) {
            doc.setFontSize(14);
            doc.setTextColor(255, 140, 0);
            doc.text('GANADORES', 20, yPosition);
            yPosition += 10;
            
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            
            ganadores.forEach((ganador, index) => {
                const numeros = ganador.numeros ? ganador.numeros.join(', ') : ganador.numero;
                doc.text(`${ganador.posicion}° Lugar: ${ganador.nombre} - Números: ${numeros} - Premio: S/${ganador.premio} - ${ganador.momento}`, 25, yPosition);
                yPosition += 7;
            });
            yPosition += 10;
        }
        
        return yPosition;
    }

    agregarJugadores(doc, yPosition) {
        const jugadores = window.bingoJugadores.getJugadores();
        
        if (jugadores.length > 0) {
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 255);
            doc.text('JUGADORES REGISTRADOS', 20, yPosition);
            yPosition += 10;
            
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            
            jugadores.forEach((jugador, index) => {
                const numeros = jugador.numeros.join(', ');
                const progreso = `${jugador.totalCompletados}/${jugador.numeros.length}`;
                const estado = jugador.totalCompletados === jugador.numeros.length ? 'COMPLETADO' : 'EN PROGRESO';
                
                doc.text(`${index + 1}. ${jugador.nombre} - Números: ${numeros} - Progreso: ${progreso} - Estado: ${estado}`, 25, yPosition);
                yPosition += 6;
                
                // Nueva página si es necesario
                if (yPosition > 270) {
                    doc.addPage();
                    yPosition = 20;
                }
            });
            yPosition += 10;
        }
        
        return yPosition;
    }

    agregarHistorial(doc, yPosition) {
        const historial = window.bingoGame.getHistorial();
        
        if (historial.length > 0) {
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 255);
            doc.text('HISTORIAL DE NÚMEROS SACADOS', 20, yPosition);
            yPosition += 10;
            
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            
            // Dividir historial en líneas de 25 números
            for (let i = 0; i < historial.length; i += 25) {
                const linea = historial.slice(i, i + 25).join(' - ');
                doc.text(`${i + 1}-${Math.min(i + 25, historial.length)}: ${linea}`, 25, yPosition);
                yPosition += 6;
                
                // Nueva página si es necesario
                if (yPosition > 270) {
                    doc.addPage();
                    yPosition = 20;
                }
            }
            yPosition += 10;
        }
        
        return yPosition;
    }

    agregarConfiguracionPremios(doc, yPosition) {
        const premios = window.bingoPremios.getPremios();
        const resumen = window.bingoPremios.obtenerResumenPremios();
        
        // Nueva página si es necesario
        if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
        }
        
        doc.setFontSize(14);
        doc.setTextColor(128, 0, 128);
        doc.text('CONFIGURACIÓN DE PREMIOS', 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        
        premios.forEach((premio, index) => {
            // Buscar si hay un ganador específico para esta posición
            const ganadorEnPosicion = resumen.ganadores.find(g => g.posicion === (index + 1));
            const estado = ganadorEnPosicion ? 'ENTREGADO' : 'PENDIENTE';
            const infoGanador = ganadorEnPosicion ? ` - Ganador: ${ganadorEnPosicion.nombre}` : '';
            
            doc.text(`${index + 1}° Premio: S/${premio} - ${estado}${infoGanador}`, 25, yPosition);
            yPosition += 7;
        });
        
        yPosition += 10;
        doc.setFontSize(12);
        doc.setTextColor(0, 100, 0);
        
        // Calcular total entregado basado en ganadores reales
        const totalEntregadoReal = resumen.ganadores.reduce((total, ganador) => total + ganador.premio, 0);
        doc.text(`Total premios entregados: S/${totalEntregadoReal}`, 25, yPosition);
        yPosition += 8;
        doc.text(`Ganadores registrados: ${resumen.ganadores.length}`, 25, yPosition);
        yPosition += 8;
        doc.text(`Premios pendientes: ${resumen.premiosRestantes}`, 25, yPosition);
        
        // Mostrar valor total de premios pendientes
        let valorPendiente = 0;
        premios.forEach((premio, index) => {
            const ganadorEnPosicion = resumen.ganadores.find(g => g.posicion === (index + 1));
            if (!ganadorEnPosicion) {
                valorPendiente += premio;
            }
        });
        
        if (valorPendiente > 0) {
            yPosition += 8;
            doc.setTextColor(255, 0, 0);
            doc.text(`Valor total premios pendientes: S/${valorPendiente}`, 25, yPosition);
        }
        
        return yPosition;
    }

    showNotification(message, tipo = 'normal') {
        if (window.bingoGame && window.bingoGame.showNotification) {
            window.bingoGame.showNotification(message, tipo);
        } else {
            alert(message);
        }
    }
}

// Instancia global de PDF
window.bingoPDF = new BingoPDF();
