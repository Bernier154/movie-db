const { ipcRenderer } = require('electron');
const settings = {
    tables_display : []
}
const appdata = {
    movies : [],
    current_drag : {}
};

function debug(){
    ipcRenderer.send('debug');
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////// EVENTS LISTENERS /////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
$('#dhead').on('dragenter','th', function(e){
    e.preventDefault();
    $(this).addClass('dragover')
})
$('#dhead').on('dragover','th', function(e){
    e.preventDefault();
})
$('#dhead').on('dragleave','th', function(e){
    $(this).removeClass('dragover')
})
$('#dhead').on('drop','th', function(e){
    $(this).removeClass('dragover');
    id = e.target.getAttribute('data-table-id');
    order = e.target.getAttribute('data-table-order');
    if(id != appdata.current_drag.id ) {
        //alert(appdata.current_drag+' prend la place de '+id)
        reorder({
            target:{
                id:id,
                order:order
            },
            current:{
                id:appdata.current_drag.id,
                order:appdata.current_drag.order
            }
        });
        appdata.current_drag = {};
    }
})
$('#dhead').on('drag','th', function(e){
    appdata.current_drag = { id:e.target.getAttribute('data-table-id'),
                                order:e.target.getAttribute('data-table-order')
                            };
})
$('.main').on('click','.fiche',function(){
    $('.main .fiche.table-active').removeClass('table-active');
    $(this).addClass('table-active');
})
$('header').on('change','.fieldCheckbox', changeFieldHandler);
$('header').on('click','#ChangingFields',reloadTables);

/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////IPC RENDERER CALLS/////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
ipcRenderer.on('log', (event, data) => {
    console.log(data);
})

function reorder(data){
    ipcRenderer.send('settings_table_display_reorder', data);
}

function getSettings() {
    ipcRenderer.send('settings_table_display', 'Select * from settings_tables_display ORDER BY ordre asc');
}
ipcRenderer.on('settings_table_display_response', (event, data) => {
    settings.tables_display = data;
    setField()
    setHeadings();
})
ipcRenderer.on('moviesResponse', (event, movies) => {
    appdata.movies = movies;
    showMovies();
})
ipcRenderer.on('settings_table_display_change_response', (event, data) => {
    fieldReload(true);
})
ipcRenderer.on('settings_table_display_reorder_response', (event, data) => {
    getSettings()
})

/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////    FUNCTIONS     /////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

function changeFieldHandler(e){
    const val = ($(this).is(':checked'))?1:0;
    const id = $(this).attr('data-id');
    settings.tables_display = settings.tables_display.map(el => {
        if(el.id == id){
            el.show = val;
        }
        return el;
    })
    ipcRenderer.send('settings_table_display_change', {id:id,val:val});
    fieldReload(false)
}
function reloadTables(e){
    e.preventDefault();
    fieldReload(false);
    setTimeout(setHeadings,50)
}
function fieldReload(reload){
    console.log('reload = '+reload.toString())
    if(reload){
        $('#ChangingFields').prop('disabled', false);
        $('#ChangingFields').empty();
        $('#ChangingFields').append('Actualiser');
        
    }else{
        $('#ChangingFields').prop('disabled', true);
        $('#ChangingFields').empty();
        $('#ChangingFields').append($('<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>'));
        $('#ChangingFields').append($('<span>Chargement...</span>'));
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////  INITIALISATION  /////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
getSettings();
function setField(){
    $('#fields').empty();
    settings.tables_display.forEach(el=>{
        checked = (el.show)?'checked':"";
        $('#fields').append($(`
        <div class="custom-control pl-0  custom-checkbox">
            <input  data-id=`+el.id+` type="checkbox" class="fieldCheckbox custom-control-input pull-right" id="check`+el.name+`" `+checked+` >
            <label  class="pull-right w-100 custom-control-label" for="check`+el.name+`">`+el.name+`</label>
        </div>
        `));
    });
    $('#fields').append($(`<button id="ChangingFields" class="mt-2 d-block mx-auto btn btn-primary btn-sm">Actualiser</button>`));
}
function setHeadings(){
    document.getElementById('films').innerHTML = "";
    $('#dhead tr').empty();
    let count = 0;
    settings.tables_display.forEach(el => {
        if(el.show){
            count++;
            $('#dhead tr').append($('<th draggable="true" data-table-id="'+el.id+'" data-table-order="'+el.ordre+'" style="width:'+el.width+'px;" class="sticky-top sticky-thead" scope="col">'+el.name+'</div></th>'));
        }
    });
    $('#films').append($(`<tr><td colspan="${count}">
                                    <div class="d-flex p-5 justify-content-center">
                                        <div class="spinner-grow" style="width: 5rem; height: 5rem;" role="status">
                                        </div>
                                    </div>
                                </td></tr>`))
    setTimeout(function(){
        if(appdata.movies.length == 0){
            getAllMovies();
        }else {
            showMovies();
        }
    },50)
    
}
function getAllMovies(){
    ipcRenderer.send('dbRequests', `
                                    SELECT movies.* ,GROUP_CONCAT(genres.name) as genre, physical_supports.name as numref, physical_support_types.name as support, classifications.nom as classification
                                    FROM movies
                                    LEFT JOIN movie_genre  ON movies.id = movie_genre.movie_id
                                    LEFT JOIN genres  ON genres.id = movie_genre.genre_id
                                    LEFT JOIN movie_physical_support ON movies.id =  movie_physical_support.movie_id
                                    LEFT JOIN physical_supports  ON movie_physical_support.physical_support_id = physical_supports.id
                                    LEFT JOIN physical_support_types ON physical_supports.type_id = physical_support_types.id
                                    LEFT JOIN movie_classification ON movies.id =  movie_classification.movie_id
                                    LEFT JOIN classifications ON movie_classification.movie_id = classifications.id

                                    GROUP BY movies.id
                                    `); 
}
function showMovies(){
    document.getElementById('films').innerHTML = "";
    rows = document.createDocumentFragment();
    let lastrow;
    console.time();
    for(let j = appdata.movies.length;j--;) {
        mv = appdata.movies[j];
        let row = document.createElement('tr');
        row.className = 'fiche';
        row.id = `movie_${mv.id}`;
        for(let i = 0;i<settings.tables_display.length;i++){
            let el = settings.tables_display[i];
            if(el.show){
                let val = mv[el.champ];
                if(el.champ == 'classification' && mv[el.champ] == null){
                    val = 'Tous public';
                }else if(el.champ == 'vu' && mv[el.champ] == null){
                    val = 'non';
                }else if(el.champ == 'titre_alt' && mv[el.champ] == null){
                    val = '';
                }
                cell = document.createElement('td');
                cell.style.width = el.width+'px';
                cell.innerHTML = val;
                row.appendChild(cell);
            }
        }
        if(j == appdata.movies.length-1){
            lastrow = row.id
        }
        rows.insertBefore(row, rows.childNodes[0]);
        
    };     
    console.timeEnd();
    document.getElementById('films').appendChild(rows)
    fieldReload(true)
    
}
/////////////////////////////////////////////////////////////////////////////////////////////////////


