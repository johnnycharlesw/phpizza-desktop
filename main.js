const { app, BrowserWindow, ipcMain, session } = require('electron/main')
const path = require('node:path')
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const server = express();
const PORT = process.env.PORT || 1234;
const UI_DIR = path.join(__dirname, '.');
const PHPIZZA_PARTITION = 'persist:phpizza';
const PHPIZZA_COOKIE_URLS = [
  `http://phpizza.localhost:${PORT}/`,
  'http://phpizza.localhost/',
  'http://api.phpizza.localhost/',
];

server.use('/api', createProxyMiddleware({
  target: 'http://api.phpizza.localhost',
  changeOrigin: true,
  pathRewrite: { '^/api': '' },
  cookieDomainRewrite: '',
}));
server.use(express.static(UI_DIR));

async function getPhpizzaCookieHeader(ses) {
  const cookiesByName = new Map();

  for (const url of PHPIZZA_COOKIE_URLS) {
    for (const cookie of await ses.cookies.get({ url })) {
      cookiesByName.set(cookie.name, cookie);
    }
  }

  for (const cookie of await ses.cookies.get({})) {
    if (cookie.domain?.includes('phpizza.localhost')) {
      cookiesByName.set(cookie.name, cookie);
    }
  }

  return [...cookiesByName.values()]
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');
}

async function fetchGetUsernameBody(ses) {
  const cookieHeader = await getPhpizzaCookieHeader(ses);
  const headers = {
    Host: 'api.phpizza.localhost',
    Accept: 'application/json',
  };
  if (cookieHeader) {
    headers.Cookie = cookieHeader;
  }

  const endpoints = [
    `http://phpizza.localhost:${PORT}/api/GetUsername.php`,
    'http://phpizza.localhost/GetUsername.php',
    'http://api.phpizza.localhost/GetUsername.php',
    'http://127.0.0.1/GetUsername.php',
    `http://127.0.0.1:${PORT}/api/GetUsername.php`,
  ];

  for (const url of endpoints) {
    try {
      const response = await fetch(url, { headers });

      if (response.ok) {
        const body = await response.text();
        console.log('[phpizza] GetUsername fetched from', url, 'body:', body.slice(0, 200));
        if (body.trim()) {
          return body;
        }
      }
    } catch (error) {
      console.error('[phpizza] GetUsername API failed:', error.message);
    }
  }

  return '';
}

function startServer() {
  return new Promise((resolve) => {
    server.listen(PORT, '127.0.0.1', () => {
      console.log(`[ui server] http://localhost:${PORT}`);
      resolve();
    });
  });
}

ipcMain.handle('phpizza:get-username', async () => {
  const ses = session.fromPartition(PHPIZZA_PARTITION);
  const phpsessid = (await ses.cookies.get({
    url: `http://phpizza.localhost:${PORT}/`,
    name: 'PHPSESSID',
  }))[0]?.value
    ?? (await ses.cookies.get({
      url: 'http://phpizza.localhost/',
      name: 'PHPSESSID',
    }))[0]?.value
    ?? '';
  const body = await fetchGetUsernameBody(ses);

  return { body, phpsessid };
});


let mainWindow = null;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      devTools: true,
      partition: PHPIZZA_PARTITION,
      contextIsolation: true,
    },
    icon: path.join(__dirname, 'assets', 'phpizza-cms-branding', 'logo.png')
  })

  mainWindow.webContents.setUserAgent(
    `${mainWindow.webContents.getUserAgent()} phpizza-desktop`,
  );

  mainWindow.loadURL('http://phpizza.localhost:'+PORT);

  return mainWindow;
}

app.commandLine.appendSwitch(
  'disable-features',
  'ThirdPartyCookieDeprecation,ThirdPartyStoragePartitioning',
);

app.whenReady().then(async () => {
  await startServer();
  createWindow();

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