const express = require('express');
const session = require('express-session');
var path = require('path')


const server = express();
server.set('view engine', 'ejs');
server.use(express.static(path.join(__dirname, 'public')));
server.use(express.urlencoded({ extended: true }));
server.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

server.use('/',require("./routes/routes.js"));

server.use(function (req, res, next) {
    res.status(404).send("404");
});

server.listen(8080);
