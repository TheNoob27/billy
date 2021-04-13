const { Command, Embed } = require("../classes")
const Game = require("../game/Game")

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "play",
      aliases: ["p", "fob", "battle", "fight"],
      description: "Play a game of Field of Battle with friends or by yourself!",
      usage: "b!play",
      category: "FOB",
      cooldown: 6000,
      botPerms: ["EMBED_LINKS", "ADD_REACTIONS"],
      cooldownmsg: "You can play another game in {time}.",
    })
  }

  async run(message, args) {
    if (this.client.game) {
      return message.channel.send(
        `A game is already running! Please wait for that game to end before starting a new one. ${
          this.client.game.message?.url || this.client.game.channel.toString()
        }`
      )
    }

    const game = (this.client.game = new Game(message.channel))
    game.addPlayer(message.author)

    const e = () =>
      new Embed()
        .setColor(this.client.colors.color)
        .setDescription(
          `A new game is starting! React with ⚔️ to join and unreact to leave. \n${message.author.username}, React with ✅ to start (the game will start automatically in 5 minutes or if 32 people join), or react with 🛑 to cancel and not start the game.`
        )
        .addField("Players", game.playerList)
        .setTimestamp()

    const joinMessage = await message.channel.send(e())

    await joinMessage.react(["⚔️", "✅", "🛑"])

    const collector = joinMessage.createReactionCollector(
      (r, user) => ["⚔️", "✅", "🛑"].includes(r.emoji.name) && !user.bot,
      { time: 300000, maxUsers: 32, dispose: true }
    )
    collector
      .on("collect", (r, user) => {
        switch (r.emoji.name) {
          case "⚔️": {
            console.log("sword")
            if (!game.players.has(user.id)) game.addPlayer(user)
            break
          }
          case "✅": {
            console.log("check")
            if (user.id === message.author.id && game.players.size > 0) return collector.stop("start")
            return
          }
          case "🛑": {
            console.log("stop sign", user.id === message.author.id)
            if (user.id !== message.author.id) return
            this.client.game = null
            return collector.stop("cancelled")
          }
        }

        return joinMessage.edit(e())
      })
      .on("remove", (r, user) => {
        if (r.emoji.name !== "⚔️" || !game.players.has(user.id)) return
        console.log("remove")
        game.removePlayer(user)
        return joinMessage.edit(e())
      })

      .on("end", (_, r) => {
        if (r.includes("Delete")) return (this.client.game = null) // messageDelete, guildDelete etc
        if (r === "cancelled") {
          this.client.game = null
          return message.channel.send("The game has been cancelled.")
        }

        game.start() // set up
        setTimeout(() => this.play(message), 5000)
      })
  }

  /** @param {import("discord.js").Message} message */
  async play(message, isGeneral) {
    const { game } = this.client
    const enemy = game.spawnEnemy(isGeneral && "General")
    const m = await message.channel.send(game._embed())
    const { emojis } = game
    await m.react(emojis)
    game._embedInterval(m)
    const e = this.client.config.emojis

    const collector = (game._collector = m.createReactionCollector(
      (r, u) => game.players.has(u.id) && emojis.includes(r.emoji.name),
      { time: game.time, dispose: true }
    ))

    collector
      .on("collect", (r, user) => {
        const player = game.players.get(user.id)
        if (!player) return // filter bad
        switch (r.emoji.name) {
          case e.sword:
            game.attackEnemy(player)
            if (!collector.ended && player.sword.effect) game.enemy.addEffect(player.sword.effect)
            return
          case e.bow:
            return player.bow && game.attackEnemy(player, player.bow.damage, true)
          case e.axe:
            const [axe] = player.axes
            if (!axe) return
            game.attackEnemy(player, axe.damage)
            if (!collector.ended && axe.effect) game.enemy.addEffect(axe.effect)
            return
          case e.axe2:
            const [, axe2] = player.axes
            if (!axe2) return
            game.attackEnemy(player, axe2.damage)
            if (!collector.ended && axe2.effect) game.enemy.addEffect(axe2.effect)
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
        game._endCollector(m, reason === "time" ? game._regen : null)
        if (reason === "time") {
          this.client.game = null
          return message.channel.send("Your team stopped responding, so you automatically lost.")
        } else if (reason === "allDied") return this.defeat(message)
        await message.channel.send(`Yay, the ${enemy} died!`)
        game.reward(enemy.maxHP)
        if (isGeneral) return this.victory(message)
        setTimeout(() => this.play(message, game.shouldSpawnGeneral), 5000)
      })
  }

  /** @param {import("discord.js").Message} message */
  async victory(message) {
    const game = this.client.game
    // clearInterval(game._regen)
    const enemyTeam = game.team === "Humans" ? "Orcs" : "Humans"
    await message.channel.send(
      new Embed()
        .setTitle(`${game.team} Win!`)
        .setDescription(`Your team successfully defeated all of the ${enemyTeam}, so you win! 🎉`)
        .setColor(game.team === "Humans" ? "#1f5699" : "#3d8a29")
        .setTimestamp()
        .setFooter(`Congratulations! Survivors: ${game.players.size}`)
    )
    this.spawnDemon(message, game)
  }

  /** @param {import("discord.js").Message} message */
  async defeat(message) {
    const game = this.client.game
    // clearInterval(game._regen)
    const enemyTeam = game.team === "Humans" ? "Orcs" : "Humans"
    await message.channel.send(
      new Embed()
        .setTitle(`${enemyTeam} Win.`)
        .setDescription(`Your team wasn't able to successfully take down all the ${enemyTeam}, so you lose.`)
        .setColor(this.client.colors.error)
        .setTimestamp()
        .setFooter("Better luck next time.")
    )
    return this.spawnDemon(message, game)
  }

  spawnDemon(message, game) {
    if (game.shouldSpawnDemon) {
      game.players.initial
        .filter(id => !game.players.has(id))
        .forEach(id => {
          const user = this.client.users.cache.get(id)
          if (user) game.addPlayer(user) // why wouldn't there be tbh
        })
      setTimeout(() => {
        /* todo */
      }, Math.random() * 4000 + 5000) // 5-9s
    } else {
      clearInterval(game._regen)
      this.client.game = null
    }
  }
}
