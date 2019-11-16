const Discord = require('discord.js')
const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);

module.exports.run = async (client, message, args, colors, prefix) => {
if (message.author.id !== client.owner) return message.channel.send("No, I don't think I will.")
  
  if (!args[0]) return message.channel.send("Which command?").then(msg => msg.delete(5000))
  
  
  
  let init = async () => {    
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
    //console.log(client.commands.size)
const cmdFiles = await readdir("./commands/");
  message.channel.send(`Reloading a total of ${cmdFiles.length} commands.`);
  cmdFiles.forEach(f => {
    if (!f.endsWith(".js")) return;
    let props = require(`../commands/${f}`);
    delete require.cache[require.resolve(`./${f}`)]
    client.commands.set(props.help.name, props);
	props.help.aliases.forEach(alias => {
    //client.aliases.delete(alias)
    client.aliases.set(alias, props.help.name);
  })
  });
  message.channel.send(`Reloaded ${client.commands.size} commands and ${client.aliases.size} aliases`);
}

  
  
  
  
      let cmd = args[0].toLowerCase()
let thing = cmd
    try {
      if (cmd === "all") {
        init()
      } else {
        
      if (client.aliases.has(cmd)) {
        let command = client.commands.get(client.aliases.get(cmd));
        thing = command.help.name
        
      }
        delete require.cache[require.resolve(`./${thing}.js`)]
      if (client.commands.has(cmd)) {

        client.commands.delete(cmd)
        let pull = require(`./${cmd}.js`)
        client.commands.set(cmd, pull)
      } else if (client.aliases.has(cmd)) {
        
        let command = client.commands.get(client.aliases.get(cmd));
        client.commands.delete(command.help.name)
        let pull = require(`./${command.help.name}.js`)
        client.commands.set(command.help.name, pull)
        
        
        
        command.help.aliases.forEach(async alias => {
           client.aliases.delete(alias)
           client.aliases.set(alias, command.help.name)
        })
        cmd = command.help.name
        
      } else {
        let pull = require(`./${cmd}.js`)
        client.commands.set(cmd, pull)
        
      }
        return message.channel.send(`The command \`${cmd}\` has been reloaded!`)

      }
    } catch(e) {
        return message.channel.send(`Could not reload: \`${cmd}\``)
    }

    



}
module.exports.help = {
  name: "reload",
  aliases: ["refresh", "update"],
  description: "Reloads a command.",
  usage: `b!reload <command>`,
  category: "Owner Commands"
}