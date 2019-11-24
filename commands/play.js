const db = require('quick.db')
const Discord = require('discord.js')

module.exports.run = async (client, message, args, colors) => {

function setup() {
  let game = {
    players: [],
    rounds: null
  }
  let embed = new Discord.RichEmbed()
  .setColor(colors.color)
  .setDescription("A new game is starting! React with ⚔️ to join!")
  .addField("Players", "​")
  message.channel.send(embed).then(msg => {
    msg.react("⚔️")
  })

  }

}
module.exports.help = {
  name: "play",
  aliases: ["battle"],
  description: "Play a game that is supposed to mimic FOB",
  usage: `b!play`,
  category: "Soon"
}