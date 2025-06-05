const { SerialPort } = require('serialport');

// Simulador de Puerto Virtual
class VirtualDeviceSimulator {
    constructor() {
        this.isRunning = false;
        this.intervalId = null;
    }

    // Simular datos de balanza (pesos aleatorios)
    generateScaleData() {
        const weight = (Math.random() * 10 + 0.1).toFixed(2); // 0.1 - 10.1 kg
        return `${weight}\r\n`;
    }

    // Simular datos de código de barras
    generateBarcodeData() {
        const barcodes = [
            '1234567890123',
            '9876543210987',
            '4567891234567',
            '7891234567890',
            'ABC123DEF456',
            '555666777888'
        ];
        const barcode = barcodes[Math.floor(Math.random() * barcodes.length)];
        return `${barcode}\r\n`;
    }

    // Mostrar puertos disponibles para testing
    async listTestPorts() {
        console.log('\n🔍 Buscando puertos disponibles...\n');
        try {
            const ports = await SerialPort.list();
            
            if (ports.length === 0) {
                console.log('❌ No se encontraron puertos físicos.');
                console.log('💡 Sugerencias para testing:');
                console.log('   1. Usar puerto loop-back virtual');
                console.log('   2. Usar simulador de puerto serie');
                console.log('   3. Conectar cable USB-TTL en loop');
                return;
            }

            console.log('📋 Puertos encontrados:');
            ports.forEach((port, index) => {
                console.log(`${index + 1}. ${port.path}`);
                console.log(`   Fabricante: ${port.manufacturer || 'Desconocido'}`);
                console.log(`   ID: ${port.vendorId}:${port.productId || 'N/A'}`);
                console.log('');
            });
        } catch (error) {
            console.error('Error listando puertos:', error.message);
        }
    }

    // Simulador de escritura a puerto (si existe uno disponible)
    async startSimulation(portPath) {
        if (!portPath) {
            console.log('❌ Especifica un puerto válido');
            return;
        }

        try {
            const port = new SerialPort({
                path: portPath,
                baudRate: 9600,
                autoOpen: false
            });

            port.open((err) => {
                if (err) {
                    console.log(`❌ Error conectando a ${portPath}:`, err.message);
                    console.log('💡 Prueba con otro puerto o usa modo demo');
                    return;
                }

                console.log(`✅ Conectado a ${portPath}`);
                console.log('🚀 Iniciando simulación...\n');
                
                this.isRunning = true;
                let counter = 0;

                this.intervalId = setInterval(() => {
                    if (!this.isRunning) return;

                    counter++;
                    let data;

                    // Alternar entre balanza y código de barras
                    if (counter % 3 === 0) {
                        data = this.generateBarcodeData();
                        console.log(`📊 Enviando código: ${data.trim()}`);
                    } else {
                        data = this.generateScaleData();
                        console.log(`⚖️  Enviando peso: ${data.trim()}`);
                    }

                    port.write(data, (err) => {
                        if (err) console.log('Error enviando:', err.message);
                    });

                }, 3000); // Cada 3 segundos

                // Parar después de 30 segundos
                setTimeout(() => {
                    this.stopSimulation();
                    port.close();
                }, 30000);
            });

        } catch (error) {
            console.error('Error en simulación:', error.message);
        }
    }

    stopSimulation() {
        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        console.log('\n⏹️  Simulación detenida');
    }
}

// Modo Demo - datos en consola
function demoMode() {
    console.log('🎮 MODO DEMO - Datos simulados cada 2 segundos');
    console.log('Copia estos datos manualmente en tu app:\n');
    
    const simulator = new VirtualDeviceSimulator();
    let counter = 0;

    const demoInterval = setInterval(() => {
        counter++;
        
        if (counter % 3 === 0) {
            const barcode = simulator.generateBarcodeData().trim();
            console.log(`📊 Código de Barras: ${barcode}`);
        } else {
            const weight = simulator.generateScaleData().trim();
            console.log(`⚖️  Peso: ${weight} kg`);
        }

        if (counter >= 15) {
            clearInterval(demoInterval);
            console.log('\n✅ Demo completado');
        }
    }, 2000);
}

// Ejecución principal
async function main() {
    console.log('🔧 SIMULADOR DE BALANZA Y CÓDIGO DE BARRAS');
    console.log('==========================================\n');

    const simulator = new VirtualDeviceSimulator();
    
    // Mostrar puertos disponibles
    await simulator.listTestPorts();
    
    // Preguntar qué hacer
    console.log('🎯 Opciones de testing:');
    console.log('1. Ejecutar modo DEMO (datos en consola)');
    console.log('2. Simular en puerto específico');
    console.log('3. Solo listar puertos\n');

    // Para demo automático, ejecuta modo demo
    console.log('▶️  Ejecutando MODO DEMO automáticamente...\n');
    demoMode();
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main();
}

module.exports = VirtualDeviceSimulator;