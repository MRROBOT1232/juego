// Módulo de audio optimizado
class BingoAudio {
    constructor() {
        this.sonidoActivo = true;
    }

    // Métodos vacíos para compatibilidad
    hablarNumero() {}
    anunciarGanador() {}
    toggleVoz() { return false; }
    detenerVoz() {}

    reproducirSonidoBolilla() {
        if (!this.sonidoActivo) return;
        this.reproducirSonido(800, 400, 0.3, 0.1, 'sine');
    }

    reproducirSonidoFestejo() {
        if (!this.sonidoActivo) return;
        const notas = [523, 659, 784, 1047];
        notas.forEach((freq, i) => {
            setTimeout(() => this.reproducirSonido(freq, freq, 0.2, 0.2, 'triangle'), i * 100);
        });
    }

    reproducirSonido(freqInicio, freqFin, volumen, duracion, tipo = 'sine') {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.type = tipo;
            osc.frequency.setValueAtTime(freqInicio, ctx.currentTime);
            if (freqInicio !== freqFin) {
                osc.frequency.exponentialRampToValueAtTime(freqFin, ctx.currentTime + duracion);
            }
            
            gain.gain.setValueAtTime(volumen, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duracion);
            
            osc.start();
            osc.stop(ctx.currentTime + duracion);
        } catch (error) {
            console.log('Error de audio:', error);
        }
    }

    toggleSonido() {
        this.sonidoActivo = !this.sonidoActivo;
        return this.sonidoActivo;
    }
}

window.bingoAudio = new BingoAudio();
