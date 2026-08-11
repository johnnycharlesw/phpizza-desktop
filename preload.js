const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('phpizzaDesktop', {
  incognito: true,
  getSignedInUser: () => ipcRenderer.invoke('phpizza:get-username'),
});
