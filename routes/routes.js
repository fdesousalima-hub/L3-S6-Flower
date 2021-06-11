const express = require('express');
const bodyparser = require('body-parser');
const urlencodedparser = bodyparser.urlencoded({ extended: false })

const db = require('../database');
const utils = require('../utils');

const server = express.Router();

server.get('/', function (req, res) {
    res.redirect("/login");
});

server.get('/login', function (req, res) {
    res.render('login.ejs', { error_login: false });
});

server.post('/login', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    if (username && password) {
        db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function (error, results, fields) {
            if (error) throw error;
            if (results.length > 0) {
                req.session.loggedin = true;
                req.session.username = username;
                req.session.employe = results[0].employe;
                req.session.cart = {
                    bouquet: {},
                    custom: []
                };
                res.redirect('/home');
            } else {
                res.render('login.ejs', { error_login: true });
            }
        });
    } else {
        res.render('login.ejs', { error_login: false });
    }
});

server.get('/home', function (req, res) {
    if (req.session.loggedin) {
        db.query('SELECT image FROM bouquet', function (error, results, fields) {
            res.render('home.ejs',
                {
                    is_employe: req.session.employe,
                    images: results
                });
        });
    } else {
        res.redirect('/');
    }
});

server.get('/shop', function (req, res) {
    if (req.session.loggedin) {
        db.query('SELECT * FROM bouquet ', function (error, results, fields) {
            if (error) throw error;
            res.render('shop.ejs', {
                is_employe: req.session.employe,
                bouquets: results
            });
        });
    } else {
        res.redirect('/');
    }
});

server.get('/shop/:id', function (req, res) {
    if (req.session.loggedin) {
        db.query('SELECT * FROM `bouquet_content` JOIN bouquet ON bouquet.id_bouquet = bouquet_id WHERE bouquet_id = ?', [req.params.id], function (error, results, fields) {
            if (error) throw error;
            res.render('bouquet.ejs', {
                is_employe: req.session.employe,
                bouquet: results
            });
        });
    } else {
        res.redirect('/');
    }
});

server.post('/shop/:id', function (req, res) {
    if (req.session.loggedin) {
        if (!req.session.cart.bouquet[req.params.id]) {
            req.session.cart.bouquet[req.params.id] = 0;
        }
        req.session.cart.bouquet[req.params.id] += Number(req.body.amount);
        res.redirect('/shop/' + req.params.id);
    } else {
        res.redirect('/');
    }
});

server.get('/custom', function (req, res) {
    if (req.session.loggedin) {
        db.query('SELECT * FROM `flower`', function (error, results, fields) {
            if (error) throw error;
            res.render('custom.ejs', {
                is_employe: req.session.employe,
                flowers: results
            });
        });
    } else {
        res.redirect('/');
    }
});

server.post('/custom', function (req, res) {
    if (req.session.loggedin) {
        req.session.cart.custom[req.session.cart.custom.length] = req.body;
        res.redirect('/custom');
    } else {
        res.redirect('/');
    }
});

server.get('/cart', function (req, res) {
    if (req.session.loggedin) {
        var bouquet = req.session.cart.bouquet;
        var custom = req.session.cart.custom;
        var custom_simple = [];
        for (let element of custom) {
            for (var key in element) {
                element[key] = Number(element[key]);
                if (element[key] === 0) {
                    delete element[key];
                }
            }
            custom_simple[custom_simple.length] = element;
        }
        db.query('SELECT * FROM `bouquet` WHERE id_bouquet in (?)', [Object.keys(bouquet)], function (error, results, fields) {
            if (!results) {
                results = {};
            }
            res.render('cart.ejs', {
                username: req.session.username,
                is_employe: req.session.employe,
                bouquets: results,
                bouquets_amount: bouquet,
                custom: custom_simple
            });
        });
    } else {
        res.redirect('/');
    }
});

server.post('/validate', function (req, res) {
    if (req.session.loggedin) {
        for (var key in req.body) {
            if (isNaN(Number(key)) && (key != "command_total")) {
                var id_custom = key.slice(-1);
                if (Number(req.body[key]) != 0) {
                    var el = req.session.cart.custom[id_custom];
                    el.amount = Number(req.body[key]);
                    req.session.cart.custom[id_custom] = el;
                } else {
                    req.session.cart.custom.splice(id_custom, 1);
                }
            } else {
                if (Number(req.body[key]) != 0) {
                    req.session.cart.bouquet[key] = Number(req.body[key]);
                } else {
                    delete req.session.cart.bouquet[key];
                }
            }
        }
        var values;
        if (req.session.cart.custom.length > 0) {
            values = [req.session.username, "preparation", req.body.command_total];
        }
        else {
            values = [req.session.username, "finish", req.body.command_total];

        }
        var cart = req.session.cart;
        if (cart.bouquet || cart.custom.length > 0) {
            db.query('INSERT INTO command (user, status_command, price_command) VALUES (?)', [values], function (error, results, fields) {
                if (cart.bouquet) {
                    var bouquet = cart.bouquet;
                    for (var key in bouquet) {
                        if ((key != "command_total")) {
                            db.query('INSERT INTO command_bouquet (id, bouquet_id, amount_bouquet) VALUES (?)', [[results.insertId, key, bouquet[key]]]);
                        }
                    }
                }
                if (cart.custom.length > 0) {
                    var custom = cart.custom;
                    for (let element of custom) {
                        db.query('INSERT INTO command_custom (id, amount_custom) VALUES (?)', [[results.insertId, element.amount]], function (error, results, fields) {
                            for (var key in element) {
                                if (key !== "amount" && key !== "price_total") {
                                    db.query('INSERT INTO custom_content (id_custom, flower_name, amount_flower) VALUES (?)', [[results.insertId, key, element[key]]]);
                                }
                            }
                        });
                    }
                }
            });
        }
        req.session.cart = {
            bouquet: {},
            custom: []
        }
        res.redirect('/user');
    } else {
        res.redirect('/');
    }
});

server.get("/user", function (req, res) {
    if (req.session.loggedin) {
        db.query("SELECT * FROM `command` LEFT JOIN `command_bouquet` ON `command_bouquet`.`id` = `command`.`id_command` LEFT JOIN `command_custom` ON `command_custom`.`id` = `command`.`id_command` LEFT JOIN `bouquet` ON `bouquet`.`id_bouquet` = `command_bouquet`.`bouquet_id` LEFT JOIN `custom_content` ON `custom_content`.`id_custom` = `command_custom`.`custom_bouquet_id` WHERE `command`.`user` = ? ORDER BY `command`.`date_created` ASC",
            req.session.username, function (error, results, fields) {
                var commands = utils.getCommands(results);
                res.render("user.ejs", {
                    is_employe: req.session.employe,
                    commands: commands,
                });
            });
    } else {
        res.redirect('/');
    }
});

server.get('/commands', function (req, res) {
    if (req.session.loggedin && req.session.employe) {
        db.query("SELECT * FROM `command` LEFT JOIN `command_bouquet` ON `command_bouquet`.`id` = `command`.`id_command` LEFT JOIN `command_custom` ON `command_custom`.`id` = `command`.`id_command` LEFT JOIN `bouquet` ON `bouquet`.`id_bouquet` = `command_bouquet`.`bouquet_id` LEFT JOIN `custom_content` ON `custom_content`.`id_custom` = `command_custom`.`custom_bouquet_id` ORDER BY date_created ASC", function (error, results, fields) {
            var commands = utils.getCommands(results);
            res.render("commands.ejs", {
                is_employe: req.session.employe,
                commands: commands,
            });
        });
    } else {
        res.redirect('/')
    }
});

server.post('/commands/:id', urlencodedparser, function (req, res) {
    if (req.session.loggedin && req.session.employe) {
        db.query('UPDATE command SET status_command= "finish" WHERE id_command = ?', req.params.id, function (error, results, fields) {
            res.redirect('/commands');
        });
    } else {
        res.redirect('/')
    }
});

module.exports = server;