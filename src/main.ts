import { app, BrowserWindow, ipcMain } from 'electron';
import { SerialPort } from 'serialport';
import path from 'path';

let mainWindow: BrowserWindow;
let activePort: SerialPort | null = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  const isDev = !app.isPackaged;
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
};

// Listar puertos disponibles
ipcMain.handle('get-serial-ports', async () => {
  try {
    const ports = await SerialPort.list();
    console.log('Available serial ports:', ports);
    
    return ports.map(port => ({
      path: port.path,
      manufacturer: port.manufacturer,
      serialNumber: port.serialNumber,
      pnpId: port.pnpId,
      vendorId: port.vendorId,
      productId: port.productId
    }));
  } catch (error) {
    console.error('Error listing ports:', error);
    return [];
  }
});

// Conectar a puerto
ipcMain.handle('connect-port', async (_, portPath: string, baudRate: number = 9600) => {
  try {
    if (activePort && activePort.isOpen) {
      activePort.close();
    }

    activePort = new SerialPort({
      path: portPath,
      baudRate: baudRate,
      autoOpen: false
    });

    return new Promise((resolve, reject) => {
      activePort!.open((err) => {
        if (err) {
          reject(err.message);
          return;
        }

        // Escuchar datos del puerto
        activePort!.on('data', (data) => {
          const receivedData = data.toString().trim();
          console.log('Received data:', receivedData);
          
          // Enviar datos al renderer
          mainWindow.webContents.send('serial-data', {
            port: portPath,
            data: receivedData,
            timestamp: new Date().toISOString()
          });
        });

        activePort!.on('error', (err) => {
          console.error('Serial port error:', err);
          mainWindow.webContents.send('serial-error', err.message);
        });

        resolve('Connected successfully');
      });
    });
  } catch (error) {
    return Promise.reject(error);
  }
});

// Desconectar puerto
ipcMain.handle('disconnect-port', async () => {
  if (activePort && activePort.isOpen) {
    activePort.close();
    activePort = null;
    return 'Disconnected successfully';
  }
  return 'No active connection';
});

// Enviar datos al puerto (para testing)
ipcMain.handle('send-to-port', async (_, data: string) => {
  if (activePort && activePort.isOpen) {
    return new Promise((resolve, reject) => {
      activePort!.write(data, (err) => {
        if (err) reject(err.message);
        else resolve('Data sent successfully');
      });
    });
  }
  return Promise.reject('No active connection');
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (activePort && activePort.isOpen) {
    activePort.close();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});