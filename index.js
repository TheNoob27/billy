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
