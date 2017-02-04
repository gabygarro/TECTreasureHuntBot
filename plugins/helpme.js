'use strict';
var database = require('../database/database.js');
var express    = require("express");

module.exports = function(bot) {

    var name = "helpme";
    var description = "Pedir una ayuda (máx. 2)";
    var debug = false;
    var app = express()

    var exec = function(msg, reply) {
        //Validar el id de grupo del que viene el mensaje
        database.getGroupIDs(msg.chat.id, function(results) {
            if (results.length == 1) {
                //Recuperar la cantidad de helpmes que quedan
                database.getHelpmes(msg.chat.id, function(results) {
                    var helpmes = results[0].helpmeCounter;
                    reply.sendMessage("Le queda(n) " + helpmes + " helpmes.");
                    if (helpmes > 0) {
                        //In-line keyboard
                        var keyboard = {
                            reply_markup: JSON.stringify({
                                inline_keyboard: [
                                  [{ text: 'Sí', callback_data: '1' },
                                  { text: 'No', callback_data: '2' }]
                                ]
                          })
                        };
                        reply.sendMessage("¿Está seguro de canjear uno de sus helpmes?", keyboard)
                            .then(function(sent) {
                                //console.log(sent);
                            });
                        //Callback query from inline keyboard
                        bot.on('callback_query', function (callback_msg) {
                            console.log("<<<<<<<<<<<<Callback>>>>>>>>>>><");
                            console.log(callback_msg); // msg.data refers to the callback_data
                            
                            //Hide keyboard
                            bot.editMessageReplyMarkup('', {
                                message_id: callback_msg.message.message_id,
                                chat_id: callback_msg.message.chat.id
                            });

                            //bot.answerCallbackQuery(callback_msg.id, "Procesando...");
                            if (callback_msg.data == 1) { //Sí
                                //Bajar la cantidad de helpmes
                                database.decrementHelpmes(msg.chat.id, function(result) {
                                    reply.sendMessage("Helpme canjeado.");
                                    //Enviar la ubicación
                                    database.sendClueLocation(msg.chat.id, function(results) {
                                        //console.log(results);
                                        reply.sendLocation(results[0].latitude, results[0].longitude);
                                    });
                                });
                            }
                            else { //No
                                reply.sendMessage("Cancelado.");
                            }
                        });

                    }
                    else {
                        reply.sendMessage("No tiene helpmes canjeables.");
                    }
                });
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
