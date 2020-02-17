const { getgem, addxp } = require("../fobfunctions.js")
const { RichEmbed } = require("discord.js")
const Command = require("../classes/Command.js")
const Game = require("../classes/Game.js")

class Play extends Command {
  constructor(client) {
    super(client, {
      name: "play",
      aliases: ["battle"],
      description: "Play a game with friends or by yourself that is supposed to mimic FOB.",
      usage: `b!play`,
      category: "FOB",
      cooldown: 300000,
      cooldownmsg: "You can play another game in {time}."
    })
  }
  
  async run(client, message, args, colors) {
    let game = new Game(client)
    
    let embed = new RichEmbed()
    .setColor(colors.color)
    .setDescription("A new game is starting! React with ⚔️ to join and react with ➖ to leave! \n"+message.author.username+", React with ✅ to start, but the game will start automatically in 5 minutes, or react with 🛑 to cancel and not start the game.")
    .addField("Players", "​")
    message.channel.send(embed).then(async msg => {

      let options = ["⚔️", "➖", "✅", "🛑"]
      
      for (let i in options) {
        await msg.react(options[i])
      }
      
      let stopped = false
      let filter = (r, user) => ["⚔️", "➖", "✅", "🛑"].includes(r.emoji.name) && !user.bot
      let collector = msg.createReactionCollector(filter, {time: 300000})
      
      collector.on("collect", )
    })
  }
}