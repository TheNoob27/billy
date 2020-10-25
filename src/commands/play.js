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
    game.players.add(message.author)
    
    const e = () => 
      new Embed()
      .setColor(this.client.colors.color)
      .setDescription(`A new game is starting! React with ⚔️ to join and unreact to leave. \n${message.author.username}, React with ✅ to start (the game will start automatically in 5 minutes or if 32 people join), or react with 🛑 to cancel and not start the game.`)
      .addField("Players", game.playerList)
      .setTimestamp()
    
    const joinMessage = await message.channel.send(e())

    await joinMessage.react(["⚔️", "✅", "🛑"])
    
    const collector = joinMessage.createReactionCollector((r, user) => ["⚔️", "✅", "🛑"].includes(r.emoji.name) && !user.bot, { time: 300000, maxUsers: 32 })
    collector.on("collect", (r, user) => {
      switch(r.emoji.name) {
        case "⚔️": {
          if (!game.players.has(user.id)) game.addPlayer(user)
          break;
        }
        case "✅": {
          if (user.id === message.author.id && game.players.size > 0) return collector.stop("start")
          return;
        }
        case "🛑": {
          if (user.id !== message.author.id) return;
          this.client.game = null
          return collector.stop("cancelled")
        }
      }

      return joinMessage.edit(e())
    })
    .on("remove", (r, user) => {
      if (r.emoji.name !== "⚔️" || !game.players.has(user.id)) return;
      game.removePlayer(user)
      return joinMessage.edit(e())
    })
    
    .on("stop", (_, r) => {
      if (r.includes("Delete")) return this.client.game = null; // messageDelete, guildDelete etc
      if (r === "cancelled") {
        this.client.game = null
        return message.channel.send("The game has been cancelled.")
      }
      
      game.start() // set up
      setTimeout(this.play.bind(this))
    })
  }
  
  async play(isGeneral) {}
}
