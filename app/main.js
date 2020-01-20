const { app, BrowserWindow, ipcMain } = require('electron')
require('electron-reload')('./app/',{
  ignored: /node_modules|[\/\\]\.|movies.db/, argv: []
});
const {Database} = require('./scripts/database.service.js')
const DBmanager =  new Database(app.getAppPath());

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
  main_window.setMenu(null);
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
ipcMain.on('debug', (event) => {
	main_window.webContents.openDevTools();
})



ipcMain.on('dbRequests', (event, arg) => {
  DBmanager.Query(arg,requestResp);
})
function requestResp(movies){
	main_window.webContents.send('moviesResponse',movies)
}
function log(data){
	main_window.webContents.send('log',data)
}

// receive settings request and send results
ipcMain.on('settings_table_display', (event, query) => {
	DBmanager.Query(query,settings_table_display_response);
})
function settings_table_display_response(settings){
	main_window.webContents.send('settings_table_display_response',settings);
}

ipcMain.on('settings_table_display_change', (event, data) => {
	DBmanager.Query(`UPDATE settings_tables_display SET show=${data.val} WHERE id = ${data.id} `,settings_table_display_change_response);
})
function settings_table_display_change_response(response){
	main_window.webContents.send('settings_table_display_change_response',response);
}

ipcMain.on('settings_table_display_reorder', (event, data) => {
  console.log(data)
  let query1,query2;
  if(data.current.order > data.target.order){
    query1 = `UPDATE settings_tables_display SET ordre = ordre+1 WHERE ordre >= ${data.target.order} and ordre < ${data.current.order} `;
    query2 = `UPDATE settings_tables_display SET ordre = ${data.target.order} WHERE id = ${data.current.id} `;
  }else if(data.current.order < data.target.order){
    query1 = `UPDATE settings_tables_display SET ordre = ordre-1 WHERE ordre < ${data.target.order} and ordre > ${data.current.order} `;
    query2 = `UPDATE settings_tables_display SET ordre = ${(--data.target.order)} WHERE id = ${data.current.id} `;
  }
  DBmanager.QueryDouble([query1,query2],settings_table_display_reorder_response);
})

function settings_table_display_reorder_response(){
  console.log('settings_table_display_reorder_response')
	main_window.webContents.send('settings_table_display_reorder_response',true);
}