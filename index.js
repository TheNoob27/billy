const Discord = require("discord.js")
const ms = require("parse-ms")
const db = require("quick.db")
const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);
const config = require('./config.json')
let prefix = config.prefix
 // /* 
const http = require('http');
const express = require('express');
const app = express();
app.get("/", (request, response) => {
  console.log(Date(Date.now()).toString() + ": Ping Received");
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);
/*
*/

const client = new Discord.Client();
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.config = config
client.fob = new db.table("fob")

let init = async () => {
const cmdFiles = await readdir("./commands/");
  console.log(`Loading a total of ${cmdFiles.length} commands.`);
  cmdFiles.forEach(f => {
    if (!f.endsWith(".js")) return;
    let props = require(`./commands/${f}`);
    client.commands.set(props.help.name, props);
	props.help.aliases.forEach(alias => {
    client.aliases.set(alias, props.help.name);
  })
  });
  console.log(`loaded ${client.commands.size} commands and ${client.aliases.size} aliases`);
}
init();

client.on('warn', console.warn);

client.on('error', console.error);

client.on('ready', () => {
  console.log(`${client.user.username} is online!`);
  console.log(`Logged in as ${client.user.tag}`)
  client.user.setActivity("Field of Battle", {type: "PLAYING"});
  client.owner = config.owner
 client.channels.get("648154169219481600").fetchMessage("648164452297867305")
});


client.on('disconnect', () => console.log('I don\'t feel so good...'));

client.on('reconnecting', () => console.log('I am reconnecting now!'));

client.on('resume', () => console.log('I have reconnected!'));

client.on('message', async message => { 
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
        let embed = new Discord.RichEmbed()
        .setTitle("Congratulations")
        .setDescription("You have been in this server for over a week! This means you get the role <@&"+demonslayer+">!")
        .setColor("#aa0e0e")
        .setTimestamp()
        return message.channel.send(embed)
      }
      if (requiredmonth && !message.member.roles.has(gemcollector)) {
        message.member.addRole(gemcollector)
        let embed = new Discord.RichEmbed()
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
  let custom = await db.fetch(`prefix_${message.guild.id}`)
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
  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];
  let args = messageArray.slice(1);
  let command = message.content.toLowerCase().split(" ")[0];
  command = command.slice(prefix.length);
    
  let commandfile = client.commands.get(cmd.slice(prefix.length).toLowerCase());
  let alias = client.commands.get(client.aliases.get(cmd.slice(prefix.length).toLowerCase()));

  if (custom) prefix = custom 
  else prefix = config.prefix
  
  if ((commandfile || alias) && message.author.id != owner) {
    let cooldown = await client.cooldowns.fetch(`cooldown_${message.author.id}`)
  let timeout = 3000
 if (cooldown !== null && timeout - (Date.now() - cooldown) > 0) {
   return message.channel.send("You're using commands too fast!")
 }
  client.cooldowns.set(`cooldown_${message.author.id}`, Date.now())
  }
  
  if(commandfile){
    console.log(message.author.tag + " used the command " + command)
    if (args[0] === "help") {
      let prefix = await db.fetch(`prefix_${message.guild.id}`)
      if (prefix === null) prefix = "k!"
      
      let info = commandfile.help
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
      if (test) example = `**Example** ${test}`
      
      let help = new Discord.RichEmbed()
      .setTitle("Help")
      .setColor(config.help)
      .addField(`Command: ${prefix}${name}`, `**Aliases**: ${aliases} \n**Description**: ${desc} \n**Usage**: ${usage} \n${example}`)
      .setFooter("() = optional, <> = required.")
      
      return message.channel.send(help)
    } else
	  commandfile.run(client,message,args,colors,prefix).catch(err => {
      /*let submitchance = ["no", "yes", "no", "no"]
      let submit = ""
      let h = submitchance[Math.floor(Math.random() * submitchance.length)]
      if (h === "yes") submit = "\n If you want, you can send me a further explanation with the **"+prefix+"suggestion** command, so we can have a more knowledge of what really happened."
      */
      
      message.channel.send("An error occurred. We will look into this, and fix it as soon as possible.")// + submit)
      client.users.get(owner).send(`An error occurred while trying to do the command \`${command}\`. Error message: \`${err.stack}\``)
    })

    
  } else if(alias){
    console.log(message.author.tag + " used the command " + alias.help.name)
    if (args[0] === "help") {
      let prefix = await db.fetch(`prefix_${message.guild.id}`)
      if (prefix === null) prefix = "k!"
      
      let info = alias.help
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
      if (test) example = `**Example** ${test}`
      
      let help = new Discord.RichEmbed()
      .setTitle("Help")
      .setColor(config.help)
      .addField(`Command: ${prefix}${name}`, `**Aliases**: ${aliases} \n**Description**: ${desc} \n**Usage**: ${usage} \n${example}`)
      .setFooter("() = optional, <> = required.")
      
      return message.channel.send(help)
    } else
	  alias.run(client,message,args,colors,prefix).catch(err => {  
      /*
      let submitchance = ["no", "yes", "no", "no"]
      let submit = ""
      let h = submitchance[Math.floor(Math.random() * submitchance.length)]
      if (h === "yes") submit = "\n If you want, you can send me a further explanation with the **"+prefix+"suggestion** command, so we can have a more knowledge of what really happened."
      */
      
      message.channel.send("An error occurred. We will look into this, and fix it as soon as possible.")// + submit)
      client.users.get(owner).send(`An error occurred while trying to do the command \`${alias.help.name}\`. Error message: \`${err.stack}\``)
    })
  } 
  }
})


// ____________v server stuff v_______________ 

client.on("guildCreate", guild => {
  let joinms = ms(Date.now() - guild.createdAt)
let joined = `${joinms.days}d, ${joinms.hours}h and ${joinms.minutes}m old.`
let owner = guild.owner
if (owner) owner = guild.owner.user.tag
else owner = "Unknown"
  let embed = new Discord.RichEmbed()
  .setTitle("New Server!", guild.iconURL)
  .setDescription("I have been added to a new server!")
  .addField("Server", `Name: ${guild.name} \n Member Count: ${guild.members.size.toLocaleString()} \n Owner: ${owner} \n Server Age: ${joined}`)
  .setColor("#e4a1ee")
  .setTimestamp()
  .setFooter(`This now brings my server count to ${client.guilds.size}!`)
  
  client.channels.get("637370478339817482").send(embed)
  
})

client.on("guildDelete", async guild => {
  let joinms = ms(Date.now() - guild.createdAt)
let joined = `${joinms.days}d, ${joinms.hours}h and ${joinms.minutes}m old.`
let owner = guild.owner
if (owner) owner = guild.owner.user.tag
else owner = "Unknown"
  
  let embed = new Discord.RichEmbed()
  .setTitle("Removed!", guild.iconURL)
  .setDescription("I have been removed from a server!")
  .addField("Server", `Name: ${guild.name} \n Member Count: ${guild.members.size.toLocaleString()} \n Owner: ${owner} \n Server Age: ${joined}`)
  .setColor("#ff0000")
  .setTimestamp()
  .setFooter(`This now brings my server count to ${client.guilds.size} :(`)
  
  client.channels.get("637370478339817482").send(embed)
  
  
})

client.on("guildMemberAdd", member => {
  let guild = member.guild
  
  if (guild.id !== "648056524094046239") return;
  if (member.user.bot) return member.addRole("648116894267867146")
  
  member.addRole("648072679684964352")
  
})

client.on("messageReactionAdd", async (r, user) => {
  let message = r.message
  if (message.channel.type == "dm") return;
  if (message.guild.id != "648056524094046239") return;
  
  if (["🍆", "🍑", "🖕"].includes(r.emoji.name)) {
    r.remove(user)
    db.add(`badreactions_${user.id}`, 1)
    let infs = await db.fetch(`badreactions_${user.id}`)
    let embed = new Discord.RichEmbed()
    .setAuthor(user.tag, user.displayAvatarURL)
    .setTitle("Inappropriate Reaction")
    .setColor(config.error)
    .setDescription("**"+user.tag+"** reacted to [a message](https://discordapp.com/channels/"+message.guild.id+"/"+message.channel.id+"/"+message.id+") in <#"+message.channel.id+"> with the emoji "+r.emoji+"."+ (infs >= 3 ? "\n***This user has now been given the <@&648213925888000026> role as they have reacted with inappropriate reactions too many times. They can no longer add new reactions to messages.***": ""))
    .setFooter((3 - infs > 0 ? 3 - infs +" more times and they will be banned from adding reactions to messages." : "They are now banned from adding reactions to messages."))
    .setTimestamp()
    if (infs >= 3) message.guild.member(user).addRole("648213925888000026")
    user.send("That emoji is not allowed!" + (infs == 3 ? " You are now banned from adding reactions to messages." : ""))
    
    return client.channels.get("648199918632304671").send(embed)
  } else {
  if (message.id !== "648164452297867305") return;
  
  let member = message.guild.member(user)
  
  if (r.emoji == "⚔️" || "⚔️".includes(r.emoji.name)) {
    if (member.roles.has("648123633658626087")) return;
    member.addRole("648123633658626087")
    user.send("You have been given the Demon Farmer role.")
  } else if (r.emoji == "🎉" || "🎉".includes(r.emoji.name)) {
    if (member.roles.has("648156899509796871")) return;
    member.addRole("648156899509796871")
    user.send("You have been given the Giveaway Ping role.")
  }
  }
})

client.on("messageReactionRemove", (r, user) => {
  let message = r.message
  
  if (message.id !== "648164452297867305") return;
  
  let member = message.guild.member(user)
  
  
  if (r.emoji == "⚔️" || "⚔️".includes(r.emoji.name)) {
    if (!member.roles.has("648123633658626087")) return;
    member.removeRole("648123633658626087")
    user.send("You have been removed from the Demon Farmer role.")
  } else if (r.emoji == "🎉" || "🎉".includes(r.emoji.name)) {
    if (!member.roles.has("648156899509796871")) return;
    member.removeRole("648156899509796871")
    user.send("You have been removed from the Giveaway Ping role.")
  }
  
})

// ____________^ server stuff ^_______________ 


client.login(process.env.TOKEN)
