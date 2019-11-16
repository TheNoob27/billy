
const Discord = require("discord.js")
const ms = require("parse-ms")
const db = require("quick.db")
const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);
const config = require('./config.json')
const http = require('http');
const express = require('express');
const app = express();
let prefix = config.prefix
app.get("/", (request, response) => {
  console.log(Date(Date.now()).toString() + ": Ping Received");
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);


const client = new Discord.Client();
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.config = config
//client.cooldowns = new db.table("cooldowns")


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
});


client.on('disconnect', () => console.log('I don\'t feel so good...'));

client.on('reconnecting', () => console.log('I am reconnecting now!'));

client.on('resume', () => console.log('I have reconnected!'));

client.on('message', async message => { 
  if (message.channel.type == "dm") {
    let embed = new Discord.RichEmbed()
    .setDescription("Hey there! My commands work best in an actual server, but since you're here.. \nInvite me: [Quick](https://discordapp.com/oauth2/authorize?client_id=636621290479812638&permissions=8&scope=bot) / [Less perms](https://discordapp.com/api/oauth2/authorize?client_id=636621290479812638&permissions=288832&scope=bot)  \n  Upvote the bot [here](https://top.gg/bot/636621290479812638/vote) -- Both highly appreciated!")
    .setColor(config.help)
    // message.channel.send(embed)
  } else {
  
  if (message.author.bot) return;
  
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
    error: config.error
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

    
  }
  if(alias){
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

// ____________^ server stuff ^_______________ 


client.login(process.env.TOKEN)