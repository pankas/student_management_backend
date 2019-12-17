"use strict"
var uuid = require('node-uuid');
var dbConnect = require('./dbconnect');
var randomstring = require("randomstring");
var _ = require('lodash');
var crypto = require('crypto');
var neo4j = require('neo4j-driver');

var graphenedbURL = process.env.GRAPHENEDB_BOLT_URL;
var graphenedbUser = process.env.GRAPHENEDB_BOLT_USER;
var graphenedbPass = process.env.GRAPHENEDB_BOLT_PASSWORD;

var driver = neo4j.driver(graphenedbURL, neo4j.auth.basic(graphenedbUser, graphenedbPass));
var session = driver.session();
session
    .run("CREATE (n {hello: 'World'}) RETURN n.name")
    .then(function(result) {
        result.records.forEach(function(record) {
            console.log(record)
        });

        session.close();
    })
    .catch(function(error) {
        console.log(error);
    });
    
    var register = (type,firstname,lastname,email,password)=>{
        let id = uuid.v4()
        let hashPwd  = password;
        console.log("password",email,password)
        return session.run(`MATCH (user:StemUser {email:"${email}"}) RETURN user`)
                    .then(results=>{
                        console.log("response",results)
                        if(!_.isEmpty(results.records)){
                            return {error:'Email address already exists',status:400}
                        }else{
                            return session.run(`CREATE (user:StemUser { id: "${id}", type: "${type}", password:"${hashPwd}", firstname: "${firstname}", lastname: "${lastname}", email: "${email}"}) RETURN user`)
                            .then(results=>{
                                // console.log("userss",results.records[0]._fields[0])
                                return results.records[0]._fields[0].properties
                            })
                            .catch(err=>{
                                console.log("error",err)
                            })
                        }
                    })
    }

    var forgotPass = (email)=>{
        return session.run(`MATCH (user:StemUser {email:"${email}"}) RETURN user`)
                        .then(results=>{
                            if(results.records.length === 0){
                                return {error:'email id does not exists',status:400}
                            }else{
                                let data = results.records[0]._fields[0].properties
                                return results.records[0]._fields[0].properties
                            }
                        })
    }

//     MATCH (n { name: 'Andy' })
// SET n.surname = 'Taylor'
// RETURN n.name, n.surname


var update = (fname,lname,email,type)=>{
    return session.run(`MATCH (n:StemUser {email:"${email}"}) SET n.firstname= "${fname}",n.lastname="${lname}",n.type="${type}" RETURN n`)
                    .then(results=>{
                        console.log("resultssss",results.records[0]._fields[0].properties)
                        return results.records[0]._fields[0].properties;
                        // if(results.records.length === 0){
                        //     return {error:'email id does not exists',status:400}
                        // }else{
                        //     let data = results.records[0]._fields[0].properties
                        //     return results.records[0]._fields[0].properties
                        // }
                    })
}

    var login = (email,password)=>{
        return session.run('MATCH (user:StemUser {email:{email}}) RETURN user',{email:email})
                        .then(results=>{
                            if(_.isEmpty(results.records)){
                                return {error:'email does not exists',status:400 }
                            }else{
                                let dbUser = results.records[0]._fields[0].properties
                                // var dbUser = _.get(results.records[0].get('user'),'properties')
                                if(dbUser.password !== password){
                                    return {error: 'You have entered wrong password',status:400}
                                }
                                return {firstname:_.get(dbUser,'firstname'),lastname:_.get(dbUser,'lastname'),email:_.get(dbUser,'email'),type:_.get(dbUser,'type'),}
                            }
                        })
    }

    var getUsers =  ()=>{
        return session.run('MATCH (user:StemUser ) RETURN user')
        .then(results=>{
            let data = []
            results.records.forEach(function(record){
                data.push(record._fields[0].properties)
            });
            console.log("data",data)
            return data;
        })   
    }

    function decrypt(encrypted){
        const decipher = crypto.createDecipher('aes192', 'a password');  
        var decrypted = decipher.update(encrypted, 'hex', 'utf8');  
        decrypted += decipher.final('utf8');  
    }

module.exports = {
    register:register,
    login: login,
    forgotPass: forgotPass,
    update:update,
    getUsers:getUsers
}