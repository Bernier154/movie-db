class Database {


    constructor(){
        this.sqlite3 = require('sqlite3').verbose();
        this.db = new this.sqlite3.Database('./app/movies.db', (err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log('Connected to the movies.db SQlite database.');
        });
    }
    

    Query(query,callback,db = this.db) {
        db.serialize(function () {
            db.all(query, function (err,res) {
                callback(res);
            });
        });
    }

}

exports.Database = Database;