const db = require('quick.db')
const Discord = require('discord.js')

module.exports.run = async (client, message, args, colors, prefix) => {
let info = client.commands.filter(cmd => cmd.help.category == "Info")
let fob = client.commands.filter(cmd => cmd.help.category == "FOB")

let infocmd = ``
let fobcmd = ``

info.map(cmd => {
  infocmd += `${prefix}${cmd.help.usage.replace("b!", "")} \n`
})
  
fob.map(cmd => {
  fobcmd += `${prefix}${cmd.help.usage.replace("b!", "")} \n`
})
  
  let help = new Discord.RichEmbed()
  .setTitle("Help")
  .setDescription("Commands: " + client.commands.size)
  .setColor(colors.help)
  .addField("Information", infocmd, true)
  .addField("Field Of Battle", fobcmd, true)
  .setFooter("If you need help with a specific command, do " +prefix+ "(command) help")
 
  return message.channel.send(help)
}
module.exports.help = {
  name: "help",
  aliases: ["h", "cmds", "commands"],
  description: "Gives help with this bot's commands.",
  usage: `b!help`,
  category: "Info"
}