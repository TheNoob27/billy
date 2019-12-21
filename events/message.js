const { RichEmbed } = require("discord.js")
const db = require("quick.db")

module.exports = (client, message) => {
 const owner = client.owner
 let config = client.config
 let prefix = client.config.prefix
 
  if (message.channel.type == "dm") {
  
  } else {
  
  if (message.author.bot) return;
    
    if (message.guild.id == "648056524094046239") {
      let demonslayer = "648072745715761182"
      let gemcollector = "648072843912806410"
      
      let requiredweek = (Date.now() - message.member.joinedAt) > 604800000
      let requiredmonth = (Date.now() - message.member.jonedAt) > 2628002880
      
      
      if (requiredweek && !message.member.roles.has(demonslayer)) {
        message.member.addRole(demonslayer)
        let embed = new RichEmbed()
        .setTitle("Congratulations")
        .setDescription("You have been in this server for over a week! This means you get the role <@&"+demonslayer+">!")
        .setColor("#aa0e0e")
        .setTimestamp()
        return message.channel.send(embed)
      }
      if (requiredmonth && !message.member.roles.has(gemcollector)) {
        message.member.addRole(gemcollector)
        let embed = new RichEmbed()
        .setTitle("Congratulations")
        .setDescription("You have been in this server for ***over a month***! This means you get the role <@&"+gemcollector+">!")
        .setColor("#cdd389")
        .setTimestamp()
        return message.channel.send(embed)
      }
      
    }
  
  if (!message.guild.me.hasPermission("SEND_MESSAGES")) {
    return message.author.send("I can't even speak :( \nPlease get someone to enable the permission `SEND MESSAGES` for me!")
  }
  
    //custom prefix
  let custom = db.fetch(`prefix_${message.guild.id}`)
  if (custom === null) prefix = config.prefix
  else prefix = custom
  
  if (message.content === `<@${client.user.id}>` || message.content === `<@!${client.user.id}>`) {
    if (message.author.bot) return;
   return message.channel.send(`My prefix for this server is \`${prefix}\`.`)
  }
  
  
    if ((!message.content || message.content == "")) return;
  
    if (message.content.startsWith(`<@${client.user.id}>`)) {
      prefix = `<@${client.user.id}>`
      message.content = message.content.replace(`<@${client.user.id}> `, `<@${client.user.id}>`)
    } else if (message.content.startsWith(`<@!${client.user.id}>`)) {
      prefix = `<@!${client.user.id}>`
      message.content = message.content.replace(`<@!${client.user.id}> `, `<@!${client.user.id}>`)
    }

  
  

  if (!message.content.startsWith(prefix)) return;
  
  if (!message.guild.me.hasPermission("EMBED_LINKS")) {
    return message.channel.send("Sorry, but I don't have the permission `EMBED LINKS`, therefor, I cannot function properly.")
  }
 
  
  const owner = config.owner
  const colors = {
    color: config.color,
    help: config.help,
    error: config.error,
    invis: config.invis
  }
  let messageArray = message.content.slice(prefix.length).split(/ +/g);
  let cmd = messageArray[0];
  let args = messageArray.slice(1);
  
  let command = client.commands.get(cmd.toLowerCase()) || client.commands.get(client.aliases.get(cmd.toLowerCase()));

  if (custom) prefix = custom 
  else prefix = config.prefix
  
  
  if(command){
    if (command.cooldowns.has(message.author.id)) return command.sendCooldown(message.channel, message.author.id)
    
    command.addCooldown(message.author.id)
    
    console.log(message.author.tag + " used the command " + command.help.name + " in guild "+ message.guild.name)
    
    if (args[0] === "help") {
      let info = command.help
      let name = info.name
      let aliases = info.aliases
      let desc = info.description
      let usage = info.usage
      let test = info.example
      let example = ``
      if (aliases.length < 1) aliases = "Not set"
      else aliases = aliases.join(", ")
      if (!desc) desc = "Not set"
      if (!usage) usage = "Not set"
      else usage = usage.replace("k!", prefix)
      if (test) example = `**Example**: ${test}`
      
      let help = new RichEmbed()
      .setTitle("Help")
      .setColor(config.help)
      .addField(`Command: ${prefix}${name}`, `**Aliases**: ${aliases} \n**Description**: ${desc} \n**Usage**: ${usage} \n${example}`)
      .setFooter("() = optional, <> = required.")
      
      return message.channel.send(help)
    } else
	  command.run(client,message,args,colors,owner,prefix).catch(err => {   
      if (err.message.toString().includes("Missing Permissions")){
        client.users.get(owner).send(`An error occurred while trying to do the command \`${command.help.name}\` in guild \`${message.guild.name}\`, because I do not have required permissions. \nError message: \`${err.stack}\``)
        return message.channel.send("I seem to be missing permissions, please make sure I have the following. \n**EMBED LINKS\nMANAGE MESSAGES**")
      } 
      
      message.channel.send("An error occurred. We will look into this, and fix it as soon as possible.")
      client.users.get(owner).send(`An error occurred while trying to do the command \`${command.help.name}\` in guild \`${message.guild.name}\`. Error message: \`${err.stack}\``)
    })
  } 
  }
}