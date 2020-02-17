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
  }
}