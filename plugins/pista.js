'use strict';
var database = require('../database/database.js');
var express    = require("express");

module.exports = function(bot) {

    var name = "pista";
    var description = "Obtener pista";
    var debug = false;
    var app = express()

    var exec = function(msg, reply) {
        //Validar el id de grupo del que viene el mensaje
        database.getGroupIDs(msg.chat.id, function(results) {
            if (results.length == 1) {
                //Parsear mensaje para obtener código
                var codigo = msg.command.params[0] || null;
                if (codigo != null) {
                    //Validar el código
                    database.getClue(codigo, msg.chat.id, function(results) {
                        if (results.length == 1) {
                            var pista = "Pista no. " + results[0].cluenumber + 
                                "\n\n" + results[0].text;
                            reply.sendMessage(pista);
                            //Actualizar la fecha de desbloqueo y la siguiente pista
                            if (!debug) {
                                database.unlockClue(codigo, msg.chat.id, function(results) {
                                    //console.log(results);
                                    console.log(msg.chat.title + "\nPista " + codigo + " desbloqueada. ");
                                    database.incrementNextClue(msg.chat.id, function(results) {
                                        //console.log(results);
                                        console.log("Marcador de pista incrementado.");
                                    });
                                });
                            }
                        }
                        else {
                            reply.sendMessage("Código incorrecto.");
                        }
                    });
                }
                else {
                    reply.sendMessage("Código nulo.");
                }
            }
            else {
                reply.sendMessage("Comando no disponible si no es parte del Treasure Hunt.");
            }
        });
    };

    return {
        name: name,
        exec: exec,
        description: description,
        help: '/' + name + " [msg] - " + description
    }
};
