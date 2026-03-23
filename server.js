const cds = require('@sap/cds');
const path = require('path');

cds.on('bootstrap', app => {
    const express = require('express');
    app.use(express.static(path.join(__dirname, 'app/resources')));
});

module.exports = cds.server;
