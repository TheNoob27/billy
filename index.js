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


client.login(process.env.TOKEN)
