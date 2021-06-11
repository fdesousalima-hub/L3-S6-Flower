const sql = require('mysql');

var connection = sql.createConnection({
	host     : 'localhost',
	user     : 'pw',
	password : 'pw',
	database : 'pwdm'
});

module.exports = connection;
