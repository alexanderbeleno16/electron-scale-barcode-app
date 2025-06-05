import { contextBridge, ipcRenderer } from 'electron';

export interface SerialPortInfo {
  path: string;
  manufacturer?: string;
  serialNumber?: string;
  pnpId?: string;
  vendorId?: string;
  productId?: string;
}

export interface SerialData {
  port: string;
  data: string;
  timestamp: string;
}

contextBridge.exposeInMainWorld('electronAPI', {
  // Métodos para comunicación con main process
  getSerialPorts: (): Promise<SerialPortInfo[]> => ipcRenderer.invoke('get-serial-ports'),
  connectPort: (portPath: string, baudRate?: number): Promise<string> => 
    ipcRenderer.invoke('connect-port', portPath, baudRate),
  disconnectPort: (): Promise<string> => ipcRenderer.invoke('disconnect-port'),
  sendToPort: (data: string): Promise<string> => ipcRenderer.invoke('send-to-port', data),

  // Listeners para datos del puerto serial
  onSerialData: (callback: (data: SerialData) => void) => {
    ipcRenderer.on('serial-data', (_, data) => callback(data));
  },
  onSerialError: (callback: (error: string) => void) => {
    ipcRenderer.on('serial-error', (_, error) => callback(error));
  },
  
  // Limpiar listeners
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners('serial-data');
    ipcRenderer.removeAllListeners('serial-error');
  }
});