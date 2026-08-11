const { app, BrowserWindow
      ,  session 
      } = require('electron/main')
const path = require('node:path')
const express = require('express');
const server = express();
const PORT = process.env.PORT || 1234;
const UI_DIR = path.join(process.cwd(), '.');
server.use(express.static(UI_DIR));

let promise = new Promise(function (){
    server.listen(PORT, '127.0.0.1', () => {
      console.log(`[ui server] http://localhost:${PORT}`);
    //   resolve();
    });
});


function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      devTools: true,
      partition: "persist:phpizza",
    },
    icon: path.join(__dirname, 'assets', 'phpizza-cms-branding', 'logo.png')
  })

  win.loadURL('http://phpizza.localhost:'+PORT);
  
//   win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})