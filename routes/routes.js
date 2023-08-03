const express = require('express');
const controller = require('../controllers/controller.js');

const app = express();

app.get('/', controller.home);

app.get('/login', controller.login);

app.post('/login',controller.registerThru);

app.get('/index',controller.home);

app.post('/index',controller.loginIndex);

app.get('/editProfile', controller.Profile);

app.get('/register',controller.register);

app.get('/ReviewForUserAccessOnly', controller.rev);

app.post('/ReviewForUserAccessOnly', controller.postRev);

app.get('/update', controller.updateH);

app.get('/saveEdit', controller.updateC);

app.get('/delete', controller.delete);

app.get('/logout',controller.logOut);

app.get('/emailCheck', controller.validateEmail);

app.get('/nameCheck', controller.validateName);

module.exports = app;