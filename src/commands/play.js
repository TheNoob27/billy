const { Command, Embed } = require("../classes")
const Game = require("../game/Game")

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "play",
      aliases: ["p", "fob", "battle"],
      description: "Play a game of Field of Battle with friends or by yourself!",
      usage: "b!play",
      category: "FOB",
      cooldown: 60000,
      botPerms: ["EMBED_LINKS", "ADD_REACTIONS"],
      cooldownmsg: "You can play another game in {time}."
    })
  }
  
  async run(message, args) {
    if (this.client.game) {
      return message.channel.send(
        `A game is already running! Please wait for that game to end before starting a new one. 
        ${this.client.game.message && this.client.game.message.url || this.client.game.channel.toString()}`)
    }

    const game = this.client.game = new Game(message.channel)
    const joinMessage = await message.channel.send(
      new Embed()
      .setColor(this.client.colors.color)
      .setDescription(`A new game is starting! React with ⚔️ to join and unreact to leave! \n${message.author.username}, React with ✅ to start (the game will start automatically in 5 minutes or if 32 people join), or react with 🛑 to cancel and not start the game.`)
      .addField("Players")
      .setTimestamp()
    )

    await joinMessage.react(["⚔️", "✅", "🛑"])
    joinMessage.createReactionCollector((r, user) => ["⚔️", "✅", "🛑"].includes(r.emoji.name) && !user.bot, { time: 300000, maxUsers: 32 })
    collector.on("collect", (r, user) => {
      switch(r.emoji.name) {
        case "⚔️": {
          break;
        }
        case "✅": {
          break;
        }
        case "🛑": {
          break;
        }
      }

      if (r.emoji == options[0]) {
        if (game.players.has(user.id)) return;
        game.addPlayer(user)
      } else if (r.emoji == options[1]) {
        if (!game.players.has(user.id)) return;
        game.removePlayer(user)
      } else if (r.emoji == options[2]) {
        if (user.id !== message.author.id || game.players.size <= 0) return;
        return collector.stop("start")
      } else {
        if (user.id !== message.author.id) return;
        client.game = null
        return collector.stop("cancel")
      }
    })
    .on("remove", (r, user) => {

    })
  }
}
