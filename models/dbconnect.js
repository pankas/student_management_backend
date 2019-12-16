"use strict";

var nconf = require('../config');
var neo4j = require('neo4j-driver');
// var neo4j = require('neo4j-driver');

var driver = neo4j.driver(nconf.get('neo4j-local'),neo4j.auth.basic(nconf.get('USERNAME'),nconf.get('PASSWORD')));

if(nconf.get('neo4j')=='remote'){
    driver = neo4j.driver(nconf.get('neo4j-remote'), neo4j.auth.basic(nconf.get('USERNAME'), nconf.get('PASSWORD')));
}

exports.getSession = (context)=>{
    if(context.neo4jSession){
        return context.neo4jSession;
    }
    else{
        context.neo4jSession = driver.session();
        return context.neo4jSession;
    }
}
