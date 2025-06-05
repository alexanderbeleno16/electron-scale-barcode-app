import { useState, useEffect } from 'react';
import './App.css';
import { log } from 'console';

interface SerialPortInfo {
  path: string;
  manufacturer?: string;
  serialNumber?: string;
  pnpId?: string;
  vendorId?: string;
  productId?: string;
}

interface SerialData {
  port: string;
  data: string;
  timestamp: string;
}

declare global {
  interface Window {
    electronAPI: {
      getSerialPorts: () => Promise<SerialPortInfo[]>;
      connectPort: (portPath: string, baudRate?: number) => Promise<string>;
      disconnectPort: () => Promise<string>;
      sendToPort: (data: string) => Promise<string>;
      onSerialData: (callback: (data: SerialData) => void) => void;
      onSerialError: (callback: (error: string) => void) => void;
      removeAllListeners: () => void;
    };
  }
}

function App() {
  const [ports, setPorts] = useState<SerialPortInfo[]>([]);
  const [selectedPort, setSelectedPort] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('');
  const [receivedData, setReceivedData] = useState<SerialData[]>([]);
  const [scaleData, setScaleData] = useState<string>('');
  const [barcodeData, setBarcodeData] = useState<string>('');
  const [baudRate, setBaudRate] = useState<number>(9600);

  useEffect(() => {
    loadPorts();
    
    // Setup listeners
    window.electronAPI.onSerialData((data: SerialData) => {
      setReceivedData(prev => [...prev.slice(-9), data]);
      
      // Detectar tipo de dato (muy básico)
      if (data.data.match(/^\d+\.?\d*$/)) {
        setScaleData(data.data); // Probablemente peso
      } else if (data.data.length > 5) {
        setBarcodeData(data.data); // Probablemente código de barras
      }
    });

    window.electronAPI.onSerialError((error: string) => {
      setConnectionStatus(`Error: ${error}`);
      setIsConnected(false);
    });

    return () => {
      window.electronAPI.removeAllListeners();
    };
  }, []);

  const loadPorts = async () => {
    try {
      const portList = await window.electronAPI.getSerialPorts();
      console.log('Puertos disponibles:', portList);
      
      setPorts(portList);
    } catch (error) {
      console.error('Error loading ports:', error);
    }
  };

  const connectToPort = async () => {
    if (!selectedPort) return;
    
    try {
      setConnectionStatus('Conectando...');
      const result = await window.electronAPI.connectPort(selectedPort, baudRate);
      setConnectionStatus(result);
      setIsConnected(true);
    } catch (error) {
      setConnectionStatus(`Error: ${error}`);
      setIsConnected(false);
    }
  };

  const disconnect = async () => {
    try {
      const result = await window.electronAPI.disconnectPort();
      setConnectionStatus(result);
      setIsConnected(false);
      setReceivedData([]);
    } catch (error) {
      setConnectionStatus(`Error: ${error}`);
    }
  };

  const sendTestData = async () => {
    try {
      await window.electronAPI.sendToPort('TEST\r\n');
      setConnectionStatus('Comando de test enviado');
    } catch (error) {
      setConnectionStatus(`Error enviando: ${error}`);
    }
  };

  return (
    <div className="app">
      <h1>Monitor de Balanza y Lector de Código de Barras</h1>
      
      <div className="controls">
        <div className="port-selection">
          <label>Puerto Serial:</label>
          <select 
            value={selectedPort} 
            onChange={(e) => setSelectedPort(e.target.value)}
            disabled={isConnected}
          >
            <option value="">Seleccionar puerto...</option>
            {ports.map((port) => (
              <option key={port.path} value={port.path}>
                {port.path} - {port.manufacturer || 'Desconocido'}
              </option>
            ))}
          </select>
          
          <label>Baud Rate:</label>
          <select 
            value={baudRate} 
            onChange={(e) => setBaudRate(Number(e.target.value))}
            disabled={isConnected}
          >
            <option value={9600}>9600</option>
            <option value={19200}>19200</option>
            <option value={38400}>38400</option>
            <option value={57600}>57600</option>
            <option value={115200}>115200</option>
          </select>
        </div>

        <div className="buttons">
          <button onClick={loadPorts} disabled={isConnected}>
            🔄 Actualizar Puertos
          </button>
          <button 
            onClick={connectToPort} 
            disabled={!selectedPort || isConnected}
          >
            🔌 Conectar
          </button>
          <button onClick={disconnect} disabled={!isConnected}>
            ❌ Desconectar
          </button>
          <button onClick={sendTestData} disabled={!isConnected}>
            🧪 Test
          </button>
        </div>
      </div>

      <div className="status">
        <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
        </div>
        <div className="status-text">{connectionStatus}</div>
      </div>

      <div className="data-display">
        <div className="data-section">
          <h3>⚖️ Balanza</h3>
          <div className="data-value">{scaleData || 'Sin datos'}</div>
        </div>
        
        <div className="data-section">
          <h3>📊 Código de Barras</h3>
          <div className="data-value">{barcodeData || 'Sin datos'}</div>
        </div>
      </div>

      <div className="raw-data">
        <h3>📥 Datos Recibidos (Últimos 10)</h3>
        <div className="data-log">
          {receivedData.length === 0 ? (
            <div className="no-data">No hay datos recibidos</div>
          ) : (
            receivedData.map((data, index) => (
              <div key={index} className="data-entry">
                <span className="timestamp">{new Date(data.timestamp).toLocaleTimeString()}</span>
                <span className="port">{data.port}</span>
                <span className="data">{data.data}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;