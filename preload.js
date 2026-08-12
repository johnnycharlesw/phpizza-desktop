const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('phpizzaDesktop', {
  incognito: false,
  getSignedInUser: () => ipcRenderer.invoke('phpizza:get-username'),
});
