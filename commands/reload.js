const { Collection } = require('discord.js')
const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);
const Command = require("../classes/Command.js")

class Reload extends Command {
  constructor(client) {
    super(client, {
      name: "reload",
      aliases: ["refresh", "update"],
      description: "Reloads a command.",
      usage: `star reload <command>`,
      category: "Owner Commands"
    })
  }
  
  async run(client, message, args, colors) {
if (message.author.id !== client.owner) return message.channel.send("No, I don't think I will.")
  
  if (!args[0]) return message.channel.send("Which command?").then(msg => msg.delete(5000))
  
  
  
  let init = async () => {    
client.commands = new Collection();
client.aliases = new Collection();
    //console.log(client.commands.size)
const cmdFiles = await readdir("./commands/");
  message.channel.send(`Reloading a total of ${cmdFiles.length} commands.`);
  cmdFiles.forEach(f => {
    if (!f.endsWith(".js")) return;
    let props = new (require(`../commands/${f}`))(client)
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
      } else if (cmd == "file" && args[1]) {
        let file = args[1]//.toLowerCase()
        
        if (!file.endsWith(".js") && !file.endsWith(".json")) {
          delete require.cache[require.resolve(`../${file}.js`)]
          return message.channel.send("The file `"+file+".js` has been reloaded!")
        } else {
          delete require.cache[require.resolve(`../${file}`)]
          return message.channel.send("The file `"+file+"` has been reloaded!")
        }
      } else {
        
      if (client.aliases.has(cmd)) {
        let command = client.commands.get(client.aliases.get(cmd));
        thing = command.help.name
        
      }
        delete require.cache[require.resolve(`./${thing}.js`)]
      if (client.commands.has(cmd)) {

        client.commands.delete(cmd)
        let pull = new (require(`./${cmd}.js`))(client)
        client.commands.set(cmd, pull)
        
        pull.help.aliases.forEach(async alias => {
           client.aliases.delete(alias)
           client.aliases.set(alias, pull.help.name)
        })
      } else if (client.aliases.has(cmd)) {
        
        let command = client.commands.get(client.aliases.get(cmd));
        client.commands.delete(command.help.name)
        let pull = new (require(`./${command.help.name}.js`))(client)
        client.commands.set(command.help.name, pull)
        
        
        
        command.help.aliases.forEach(async alias => {
           client.aliases.delete(alias)
           client.aliases.set(alias, command.help.name)
        })
        cmd = command.help.name
        
      } else {
        let pull = new (require(`./${cmd}.js`))(client)
        client.commands.set(cmd, pull)
        
      }
        return message.channel.send(`The command \`${cmd}\` has been reloaded!`)

      }
    } catch(e) {
        return message.channel.send(`Could not reload: \`${cmd}\` \n Error Message: \`\`\`js\n${e}\n\`\`\``)
    }

    



}

}

module.exports = Reload