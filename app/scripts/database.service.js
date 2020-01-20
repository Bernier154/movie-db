class Database {


    constructor(path){
        this.sqlite3 = require('sqlite3').verbose();
        this.connection = '';
        this.db = new this.sqlite3.Database(path+'/app/movies.db', (err) => {
            if (err) {
                this.connection = err.message;
                return console.error(err.message);
            }
            this.connection = 'Connected to the movies.db SQlite database.';
            console.log('Connected to the movies.db SQlite database.');
        });
        
    }
    

    Query(query,callback,db = this.db) {
        db.serialize(function () {
            console.log(query+' ->')
            db.all(query, function (err,res) {
                if (err) {
                    callback(err.message)
                    return console.error(err.message);
                }
                console.log(res)
                callback(res);
            });
        });
    }
    QueryDouble(queries,callback,db = this.db) {
        const self = this;
        self.Query(queries[0],function(){
            self.Query(queries[1],callback)
        })
    }

}

exports.Database = Database;