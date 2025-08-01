// Configuración global del juego
class BingoConfig {
    constructor() {
        this.totalNumeros = 25;
        this.cantidadPremios = 5;
        this.premiosDefecto = [500, 300, 200, 100, 50];
        this.intervaloDefecto = 3000; // 3 segundos
        this.columnasPorPantalla = {
            desktop: 5,
            tablet: 5,
            mobile: 5
        };
    }

    getTotalNumeros() {
        return this.totalNumeros;
    }

    setTotalNumeros(total) {
        this.totalNumeros = total;
    }

    getCantidadPremios() {
        return this.cantidadPremios;
    }

    setCantidadPremios(cantidad) {
        this.cantidadPremios = cantidad;
    }

    getPremiosDefecto() {
        return [...this.premiosDefecto];
    }

    getColumnasTablero() {
        const width = window.innerWidth;
        if (width <= 480) return this.columnasPorPantalla.mobile;
        if (width <= 768) return this.columnasPorPantalla.tablet;
        return this.columnasPorPantalla.desktop;
    }
}

// Instancia global de configuración
window.bingoConfig = new BingoConfig();
