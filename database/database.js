//Imports
var express    = require("express");
var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'treasurehuntbot',
    password : 'Treasurehuntbot-11',
    database : 'treasurehunt'
});
var app = express();

module.exports.connect = function() {
    connection.connect(function(err) {
        if (!err) {
            console.log("Database connected...");    
        } else {
            console.log("Error connecting database...");    
        }
    });
}

module.exports.getAdmins = function() {
    var connect = module.exports.connect();
    connection.query('SELECT * from admin LIMIT 2', function(err, rows, fields) {
        connection.end();
        if (!err)
            console.log('The solution is: ', rows);
        else
            console.log('Error while performing query.');
        });
}

module.exports.getGroupIDs = function(groupID, callback) {
    //var connect = module.exports.connect();
    connection.query('SELECT 1 FROM `group` WHERE groupnumber = ?', 
            [groupID], function(err, rows, fields) {
        //connection.end();
        if (!err) {
            callback(rows);
        }
        else {
            console.log('Error while performing query.');
        }
    });  
}

module.exports.getClue = function(cluecode, groupID, callback) {
    connection.query("SELECT cluenumber, `text` FROM clue, `group`" +
        " WHERE unlockcode = " + connection.escape(cluecode) +
        " AND group_idGroup = idGroup" +
        " AND groupnumber = " + groupID +
        " AND nextClue = cluenumber" + 
        " AND unlocked IS NULL",
        function(err, rows, fields) {
            if (!err) {
                callback(rows);
            }
            else {
                console.log("Error retrieving clue.");
            }
        });
}

module.exports.unlockClue = function(cluecode, groupID, callback) {
    connection.query("UPDATE clue SET unlocked = NOW()" +
        " WHERE unlockcode = " + connection.escape(cluecode) +
        " AND group_idGroup = (SELECT idGroup FROM `group` WHERE groupnumber = " +
        groupID + ")",
        function(err, result) {
            if (!err) {
                callback(result);
            }
            else {
                console.log("Error unlocking clue.");
            }
        });
}

module.exports.incrementNextClue = function(groupID, callback) {
    connection.query("UPDATE `group` SET nextClue = nextClue + 1 " +
        "WHERE groupnumber = " + groupID,
        function(err, result) {
            if (!err) {
                callback(result);
            }
            else {
                console.log("Error incrementing next clue.");
            }
        });
}
