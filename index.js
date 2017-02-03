'use strict';

// Bot setup
var TelegramBot = require('node-telegram-bot-api'),
_ = require('lodash'),
utils = require('./lib/utils'), 
path = require('path'),
conf = require('./conf.json'),
request = require('request');

var bot = new TelegramBot(conf.bot.token, conf.bot.opts);
bot.plugins = [];

// Reply functions
var reply = function (chatId) {
    return {
        forwardMessage: function(fromChatId, messageId) {
            return bot.forwardMessage(chatId, fromChatId, messageId)
        },
        sendChatAction: function(action) {
            return bot.sendChatAction(chatId, action);
        },
        send: function(data, options) {
            var funtionType = utils.lookupFunctionType(data, options);

            if(funtionType === 'message') {
                return this.sendMessage(data, options);
            } else if(funtionType === 'photo') {
                return this.sendPhoto(data, options);
            } else if(funtionType === 'audio') {
                return this.sendAudio(data, options);
            } else if(funtionType === 'document') {
                return this.sendDocument(data, options);
            } else if(funtionType === 'sticker') {
                return this.sendSticker(data, options);
            } else if(funtionType === 'video') {
                return this.sendVideo(data, options);
            } else if(funtionType === 'location') {
                return this.sendLocation(data.lat, data.lng, options);
            } else {
                throw new Error('Not valid FunctionType');
            }
        },
        sendMessage: function(text, options) {
            return bot.sendMessage(chatId, text, options);
        },
        sendPhoto: function(photo, options) {
            return bot.sendPhoto(chatId, photo, options);
        },
        sendAudio: function(audio, options) {
            return bot.sendAudio(chatId, audio, options);
        },
        sendDocument: function(document, options) {
            return bot.sendDocument(chatId, document, options);
        },
        sendSticker: function(sticker, options) {
            return bot.sendSticker(chatId, sticker, options);
        },
        sendVideo: function(video, options) {
            return bot.sendVideo(chatId, video, options);
        },
        sendLocation: function(latitude, longitude, options) {
            return bot.sendLocation(chatId, latitude, longitude, options);
        }
    }
};

//loadPlugin function
var loadPlugin = function (pluginPath) {
    var plugin = require(path.resolve(pluginPath))(bot, conf);

    // Default match function
    if(!plugin.match) {
        plugin.match = function (msg) {
            return msg.command.name === plugin.name;
        };
    }

    bot.plugins.push(plugin);

    return plugin;
};

/**
 *   MAIN
 **/

// Print Bot Name
bot.getMe().then(function (me) {
    console.log('Hi my name is %s!', me.username);
});

// Load Plugins
console.log("Loading plugins...");
utils.getGlobbedFiles('./plugins/**/*.js').forEach(function(pluginPath) {
    var plugin = loadPlugin(pluginPath);
    console.log(plugin.name + " loaded.");
});

// On message
bot.on('message', function (message) {
    //Revisar si es un mensaje de un grupo o de una persona
    //TO DO: Chequear que el mensaje venga de un grupo permitido
    var privado = true;
    if (message.chat.type == 'group') {
        privado = false;
    }

	// Registrar conversación a consola
	var dt = new Date();
	console.log("--------------------------------------------\n" + dt.toUTCString());
    console.log(message);

    // Parse msg text
    if (_.startsWith(message.text, '/')) { //es un comando
        // Modificación para correr help cuando se hace /start
        message.command = utils.parseCommand(message.text);
        if (privado && message.command.name == "start") {
            message.text = "/help";
            message.command = utils.parseCommand(message.text);
        }

        // Look for plugin
        var foundPlugin = false;
        _.forEach(bot.plugins, function(plugin, index) {
            if(plugin.match(message)) {
                foundPlugin = true;
                plugin.exec(message, reply(message.chat.id));
                    /*.catch(function(err) {
                        console.log(err);
                        bot.sendMessage(message.chat.id, "Error procesando su petición");
                    });*/
                return false;
            }
        });

        if(!foundPlugin) {
            var respuesta = "Comando no existente."
            bot.sendMessage(message.chat.id, respuesta);
            console.log("Yo: " + respuesta);
        }
    }
    else {
        //Enviar respuesta
        if (message.text != undefined) {
            var respuesta = "Solo entiendo si me hablan por medio de comandos. Mis comandos están aquí: /help\n";
            console.log("Yo: " + respuesta);
            bot.sendMessage(message.chat.id, respuesta);
        }
    }
});