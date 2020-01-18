const { app, BrowserWindow, ipcMain } = require('electron')
require('electron-reload')('./app/');
const {Database} = require('./scripts/database.service.js')
const DBmanager =  new Database();
let main_window
function createWindow () {
  main_window = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    },
    show: false
  })
  //main_window.setMenu(null);
  main_window.maximize();
  main_window.show();
  main_window.loadFile('./app/index.html')
  //main_window.webContents.openDevTools()
  main_window.on('closed', () => {
    main_window = null
  })
}
app.on('ready', createWindow)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('activate', () => {
  if (main_window === null) {
    createWindow()
  }
})



// Dans ce fichier, vous pouvez inclure le reste de votre code spécifique au processus principal. Vous pouvez également le mettre dans des fichiers séparés et les inclure ici.


ipcMain.on('dbRequests', (event, arg) => {
  DBmanager.Query(arg,requestResp);
})
function requestResp(movies){
	main_window.webContents.send('moviesResponse',movies)
}