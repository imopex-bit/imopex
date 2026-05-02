const { app, BrowserWindow } = require('electron');
const path = require('path');

// Comprobar si estamos en modo desarrollo
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'dist', 'logo_empresa.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // Descomentar esto si necesitas usar __dirname en el frontend,
      // pero es mejor usar preload scripts.
    },
    autoHideMenuBar: true, // Ocultar la barra de menú predeterminada de Windows
  });

  // Cargar siempre la URL de Vercel
  mainWindow.loadURL('https://imopex.vercel.app');

  // Quitar el menú por defecto para que parezca una app nativa
  mainWindow.setMenu(null);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
