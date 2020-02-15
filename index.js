const Client = require("./classes/Client.js")
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

const client = new Client();

client.on('warn', console.warn);

client.on('error', console.error);

client.on('ready', () => {
  console.log(`${client.user.username} is online!`);
  console.log(`Logged in as ${client.user.tag}`)
  client.user.setActivity("Field of Battle", {type: "PLAYING"});
});


client.on('disconnect', () => console.log('I don\'t feel so good...'));

client.on('reconnecting', () => console.log('I am reconnecting now!'));

client.on('resume', () => console.log('I have reconnected!'));


client.login()
