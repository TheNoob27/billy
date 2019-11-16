const db = require('quick.db')
const Discord = require('discord.js')

module.exports.run = async (client, message, args, colors, prefix) => {
let info = client.commands.filter(cmd => cmd.help.category == "Info")
//let mod = client.commands.filter(cmd => cmd.help.category == "Moderation")

let infocmd = ``
//let modcmd = ``

info.map(cmd => {
  infocmd += `${prefix}${cmd.help.usage.replace("b!", "")} \n`
})
  
/*mod.map(cmd => {
  modcmd += `${prefix}${cmd.help.usage.replace("k!", "")} \n`
})*/
  
  let help = new Discord.RichEmbed()
  .setTitle("Help")
  .setDescription("Commands: " + client.commands.size)
  .setColor(colors.help)
  .addField("Information", infocmd, true)
  .setFooter("If you need help with a specific command, do " +prefix+ "(command) help")
 // if (message.member.hasPermission("MANAGE_GUILD")) help.addField("Moderation", modcmd, true)
  
  return message.channel.send(help)
}
module.exports.help = {
  name: "help",
  aliases: ["h", "cmds", "commands"],
  description: "Gives help with this bot's commands.",
  usage: `b!help`,
  category: "Info"
}