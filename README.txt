## Resumen del Funcionamiento

### 🎯 **Propósito Principal**
App de escritorio para **conectar balanzas y lectores de código de barras** vía puertos USB/Serial y mostrar los datos en tiempo real.

---

### 🔧 **Componentes Clave**

#### **1. Proceso Principal (main.ts)**
- **Maneja Electron**: Crea la ventana de la aplicación
- **Gestiona puertos seriales**: Usa biblioteca `serialport` para comunicación USB
- **IPC (Inter-Process Communication)**: Comunica entre backend y frontend

#### **2. Preload (preload.ts)**
- **Puente seguro**: Expone funciones del backend al frontend
- **API segura**: Solo expone funciones específicas, no todo Node.js

#### **3. Frontend React (App.tsx)**
- **Interfaz visual**: Pantalla donde el usuario interactúa
- **Controles**: Botones y selects para manejar conexiones

---

### 📋 **Funcionalidades de la Interfaz**

#### **🔌 Selección de Puerto**
- **Detecta automáticamente** todos los puertos USB conectados
- **Muestra información** del fabricante y modelo del dispositivo
- **Configuración de velocidad** (Baud Rate: 9600, 19200, etc.)

#### **🎛️ Controles**
- **🔄 Actualizar Puertos**: Reescanea dispositivos USB conectados
- **🔌 Conectar**: Establece conexión con el dispositivo seleccionado
- **❌ Desconectar**: Cierra la conexión activa
- **🧪 Test**: Envía comando de prueba al dispositivo

#### **📊 Monitoreo en Tiempo Real**
- **⚖️ Balanza**: Muestra el peso actual (detecta números)
- **📊 Código de Barras**: Muestra el último código escaneado
- **🟢/🔴 Estado**: Indica si está conectado o desconectado

#### **📥 Log de Datos**
- **Historial**: Últimos 10 datos recibidos
- **Timestamp**: Hora exacta de cada dato
- **Puerto**: Qué puerto envió el dato
- **Datos raw**: Información tal como la envió el dispositivo

---

### 🔄 **Flujo de Uso**

1. **Conectar dispositivos** USB (balanza/lector)
2. **Hacer clic en "Actualizar Puertos"** para detectarlos
3. **Seleccionar el puerto** correspondiente
4. **Elegir velocidad** (generalmente 9600 baud)
5. **Hacer clic en "Conectar"**
6. **Ver datos en tiempo real** cuando peses algo o escanees un código

---

### 💡 **Detección Automática**
- **Números puros** (ej: "2.5", "150") → **Balanza**
- **Texto largo** (ej: códigos de barras) → **Lector de código**
- **Ambos se muestran por separado** en la interfaz

---

### ⚡ **Ventajas**
- **Plug & Play**: Solo conecta y selecciona
- **Tiempo real**: Datos instantáneos
- **Múltiples dispositivos**: Detecta todos los puertos USB
- **Histórico**: Guarda los últimos datos recibidos
- **Fácil de usar**: Interfaz intuitiva y clara

### Ejecución local modo dev
npm install
npm run dev

### Compilación y ejecutable .exe
npx tsc --project tsconfig.json 
npx vite build
npx electron-builder