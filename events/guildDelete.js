const ms = require("parse-ms")
const { RichEmbed } = require("discord.js")

module.exports = (client, guild) => {
let joinms = ms(Date.now() - guild.createdAt)
let joined = `${joinms.days}d, ${joinms.hours}h and ${joinms.minutes}m old.`
let owner = guild.owner
if (owner) owner = guild.owner.user.tag
else owner = "Unknown"
  
  let embed = new RichEmbed()
  .setTitle("Removed!", guild.iconURL)
  .setDescription("I have been removed from a server!")
  .addField("Server", `Name: ${guild.name} \n Member Count: ${guild.members.size.toLocaleString()} \n Owner: ${owner} \n Server Age: ${joined}`)
  .setColor("#ff0000")
  .setTimestamp()
  .setFooter(`This now brings my server count to ${client.guilds.size} :(`)
  
  client.channels.get("637370478339817482").send(embed)
  }