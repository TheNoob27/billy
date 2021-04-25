const { Command, Embed } = require("../classes")
const ms = require("pretty-ms")
const Versus = require("../game/Versus")

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "fight",
      aliases: ["1v1", "versus", "vs"],
      description: "1v1 a user.",
      usage: "b!fight <user>",
      category: "FOB",
      cooldown: 1000,
      botPerms: ["EMBED_LINKS"],
    })
  }

  /** @param {import("discord.js").Message} message */
  async run(message) {
    if (message.channel.versus) return message.channel.send(
      `A versus game is already running in this channel! Please wait for that match to end before starting a new one. ${
        message.channel.versus.message?.url || ""
      }`
    )

    let requested = message.mentions.users.first()
    if (requested?.id === message.author.id || requested?.bot) requested = undefined
    const game = message.channel.versus = new Versus(message.channel, message.author)
    const acceptMessage = await message.channel.send(
      requested?.toString(),
      {
        allowedMentions: { parse: [] },
        embed:
          new Embed()
            .setColor(this.client.colors.color)
            .setDescription(`**${message.author.username}** is asking you to fight them! React to accept.`)
            .setTimestamp()
            .addField("", game.playerInfo(game.host))
      }
    )

    const e = [this.client.config.emojis.sword, "🛑"]
    await acceptMessage.react(e)

    const collector = acceptMessage.createReactionCollector(
      (r, user) =>
        e.includes(r.emoji.name) &&
        (requested // pinged someone
          // its the pinged person or the author saying stop
          ? user.id === requested.id || r.emoji.name === e[1] && user.id === message.author.id
          // its not the author or its the author saying stop
          : user.id !== message.author.id || r.emoji.name === e[1]),
      { time: 60000, max: 1 }
    )

    let stopped = false
    collector.on("collect", (r, user) => {
      if (r.emoji.name === this.client.config.emojis.sword) game.addPlayer(user)
      else if (message.author.id === user.id) stopped = true
    })
    collector.on("end", (_, r) => {
      if (r.includes("Delete") || r === "time") {
        message.channel.versus = null
        if (r === "time") return message.channel.send(`No-one joined in 60 seconds, so the game was cancelled.`)
        else return
      }
      if (!game.opponent) {
        message.channel.versus = null
        return message.channel.send(stopped ? "The game has been cancelled." : `Sorry, but they said no.`)
      }
      game.start()
      acceptMessage.edit(`Starting the game with ${game.opponent.user}...`, { flags: 4 }) // hide embed
      setTimeout(() => this.play(message, game), 3000)
    })
  }

  /** @param {import("discord.js").Message} message @param {import("../game/Versus")} game */
  async play(message, game) {
    const m = await message.channel.send(game._embed())
    const { emojis } = game
    await m.react(emojis)
    game._embedInterval(m)
    const e = this.client.config.emojis

    const collector = game._collector = m.createReactionCollector(
      (r, u) => game.players.has(u.id) && emojis.includes(r.emoji.name),
      { time: 600000, dispose: true }
    )

    collector
      .on("collect", (r, user) => {
        const player = game.players.get(user.id)
        if (!player) return // filter bad
        switch (r.emoji.name) {
          case e.sword:
            player.attack()
            if (!collector.ended && player.sword.effect) game.opponent.addEffect(player.sword.effect)
            return
          case e.bow:
            return player.bow && player.attack(player.bow.damage)
          case e.axe:
            const [axe] = player.axes
            if (!axe) return
            player.attack(axe.damage)
            if (!collector.ended && axe.effect) game.opponent.addEffect(axe.effect)
            return
          case e.axe2:
            const [, axe2] = player.axes
            if (!axe2) return
            player.attack(axe2.damage)
            if (!collector.ended && axe2.effect) game.opponent.addEffect(axe2.effect)
            return
          case e.magicMissile:
            return game.attackWithSpell(player, "Magic Missile")
          case e.heal:
            return game.attackWithSpell(player, "Heal")
          case e.lifesteal:
            return game.attackWithSpell(player, "Lifesteal")
          case e.fireball:
            return game.attackWithSpell(player, "Fireball")
          case e.greaterFireball:
            return game.attackWithSpell(player, "Greater Fireball")
          case e.blink:
            return game.attackWithSpell(player, "Blink")
        }
      })
      .on("remove", collector.emit.bind(collector, "collect"))

      .on("end", async (_, reason) => {
        game._endCollector()
        if (reason.includes("Delete")) return
        if (reason === "time") {
          game.end()
          return message.channel.send("You both stopped responding, so the game was stopped.")
        }
        const w = reason === "player" ? message.author : game.opponent.user
        await message.channel.send(`And the winner is... ${w}! Congratulations!`)
        await m.edit(game._embed(() => "0s", false))
        game.reward(w.id, game.opposite(w.id).maxHP)
      })
  }
}
