const { app, BrowserWindow, ipcMain } = require('electron')
//require('./scripts/database.service.js')
console.log('allo')
const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database(app.getAppPath()+'/app/movies.db', (err) => {
  if (err) {
      return console.error(err.message);
  }
  console.log('Connected to the movies.db SQlite database.');
});

ipcMain.on('tables', (event, arg) => {
  db.serialize(function () {
    db.all("select titre from movies Limit 20", function (err, tables) {
      event.reply('rtables', tables)
    });
  });
  
})


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
  main_window.maximize();
  main_window.show();
  main_window.loadFile('./app/index.html')




  // Ouvre les DevTools.
 // main_window.webContents.openDevTools()

  // Émit lorsque la fenêtre est fermée.
  main_window.on('closed', () => {
    // Dé-référence l'objet window , normalement, vous stockeriez les fenêtres
    // dans un tableau si votre application supporte le multi-fenêtre. C'est le moment
    // où vous devez supprimer l'élément correspondant.
    main_window = null
  })


  
  

}

// Cette méthode sera appelée quand Electron aura fini
// de s'initialiser et sera prêt à créer des fenêtres de navigation.
// Certaines APIs peuvent être utilisées uniquement quand cet événement est émit.
app.on('ready', createWindow)

// Quitte l'application quand toutes les fenêtres sont fermées.
app.on('window-all-closed', () => {
  // Sur macOS, il est commun pour une application et leur barre de menu
  // de rester active tant que l'utilisateur ne quitte pas explicitement avec Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // Sur macOS, il est commun de re-créer une fenêtre de l'application quand
  // l'icône du dock est cliquée et qu'il n'y a pas d'autres fenêtres d'ouvertes.
  if (main_window === null) {
    createWindow()
  }
})



// Dans ce fichier, vous pouvez inclure le reste de votre code spécifique au processus principal. Vous pouvez également le mettre dans des fichiers séparés et les inclure ici.