'use strict';

module.exports = function(bot) {

    var name = "echo";
    var description = "Repetir tu mensaje";

    var exec = function(msg, reply) {
        if (msg.command.text == "") {
            reply.sendMessage("No puedo repetir lo que no me dicen");
        }
        else {
            reply.sendMessage(msg.command.text);
        }
    };

    return {
        name: name,
        exec: exec,
        description: description,
        help: '/' + name + " [msg] - " + description
    }
};
