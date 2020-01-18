const { ipcRenderer } = require('electron');

function getAllMovies(){
    ipcRenderer.send('dbRequests', 'Select * from movies');
}

ipcRenderer.on('moviesResponse', (event, movies) => {
    movies.forEach(mv => {
        let cell = '<tr>';
        cell +=  '<td>'+mv.titre+'</td>';
        cell +=  '<td></td>';
        cell +=  '<td></td>';
        cell +=  '<td></td>';
        cell +=  '<td></td>';
        cell +=  '<td></td>';
        cell +=  '<td></td>';
        cell +=  '<td>'+mv.note+'</td>';
        cell +=  '<td></td>';
        cell +=  '<td></td>';
        cell += '</tr>';
        $('#films').append($(cell))
    });
})
getAllMovies();