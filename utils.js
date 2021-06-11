function getCommands(results) {
    const commands = [];
    const ids = [];
    if (results.length != 0) {
        for (var i = 0; i < results.length; i++) {
            if (!(ids.includes(results[i].id_command))) {
                const command = {};
                command.date = results[i].date_created;
                command.status = results[i].status_command;
                command.price = results[i].price_command;
                command.id = results[i].id_command;
                if (results[i].bouquet_id != null) {
                    if (!Array.isArray(command.bouquet)) {
                        command.bouquet = [];
                    }
                    command.bouquet.push({
                        name: results[i].name,
                        amount: results[i].amount_bouquet,
                        image: results[i].image
                    });
                    var is = [];
                    is.push(results[i].bouquet_id);
                    for (var j = 0; j < results.length; j++) {
                        if (results[j].id_command == results[i].id_command && !(is.includes(results[j].bouquet_id))) {
                            command.bouquet.push({
                                name: results[j].name,
                                amount: results[j].amount_bouquet,
                                image: results[j].image
                            });
                            is.push(results[j].bouquet_id);
                        }
                    }
                }
                if (results[i].custom_bouquet_id != null) {
                    if (!Array.isArray(command.custom)) {
                        command.custom = [];
                    }
                    command.custom.push({
                        amount: results[i].amount_custom,
                        content: []
                    });
                    var is = [];
                    is.push(results[i].custom_bouquet_id);
                    for (var j = 0; j < results.length; j++) {
                        if (results[j].id_command == results[i].id_command && !(is.includes(results[j].custom_bouquet_id))) {
                            command.custom.push({
                                amount: results[j].amount_custom,
                                content: []
                            });
                            is.push(results[j].custom_bouquet_id);
                        }
                        if (results[j].id_command == results[i].id_command && results[j].bouquet_id == results[i].bouquet_id) {
                            command.custom[command.custom.length - 1].content.push({
                                flower_name: results[j].flower_name,
                                amount: results[j].amount_flower
                            });
                        }

                    }
                }
                commands.push(command);
                ids.push(results[i].id_command);
            }
        }
    }
    return commands;
}


exports.getCommands = getCommands;