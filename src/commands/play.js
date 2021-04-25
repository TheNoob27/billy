const { Command, Embed } = require("../classes")
const Game = require("../game/Game")
const ms = require("pretty-ms")

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "play",
      aliases: ["p", "fob", "battle"],
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

    const game = this.client.game = new Game(message.channel, message.author)
    const demon = args[0] === "demon" && message.author.owner

    const e = () =>
      new Embed()
        .setColor(this.client.colors[!demon ? "color" : "demon"])
        .setDescription(
          `${!demon ? "A new game is starting!" : "The Demon is being spawned!"} React with ⚔️ to join and unreact to leave. \n${message.author.username}, React with ✅ to start (the game will start automatically in 5 minutes or if 32 people join), or react with 🛑 to cancel and not start the game.`
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
        setTimeout(() => !demon ? this.play(message) : this.demon(message), 5000)
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
    game.players.each(player => player.addStat("wins"))
    await message.channel.send(
      new Embed()
        .setTitle(`${game.team} Win!`)
        .setDescription(`Your team successfully defeated all of the ${enemyTeam}, so you win! 🎉`)
        .setColor(this.client.colors[game.team === "Humans" ? "humans" : "orcs"])
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
        this.demon(message)
      }, Math.random() * 4000 + 5000) // 5-9s
    } else {
      clearInterval(game._regen)
      this.client.game = null
    }
  }

  /** @param {import("discord.js").Message} message */
  async demon(message) {
    const { game } = this.client
    game.players.each(player => player.addStat("demons"))
    const enemy = game.spawnEnemy({
      name: "Demon",
      hp: 1882,
      damage: 66,
    })
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
      .on("collect", async (r, user) => {
        const player = game.players.get(user.id)
        if (!player) return // filter bad
        switch (r.emoji.name) {
          case e.sword:
            if (Math.random() > 0.15) game.attackEnemy(player)
            else game.attackEnemy(player, Math.ceil(player.damage / 3))
            if (!collector.ended && player.sword.effect) game.enemy.addEffect(player.sword.effect)
            if (collector.ended) return
            if (Math.random() > 0.97) {
              // haha get flung
              await message.channel.send(`**${user.tag}** got flung!`)
              game.removePlayer(user, false)
              if (game.enemy.target === player) {
                game.enemy.clearTarget()
                const replacement = game.players.random()
                if (replacement) game.enemy.createTarget(replacement)
              }
              await waitTimeout(Math.random() * 8999 + 1000)
              await message.channel.send(`**${user.tag}** got lost in the void! They respawn in 7 seconds.`)
              game.respawnPlayer(user, 7000, null, false)
            }
            return
          case e.bow:
            return player.bow && game.attackEnemy(player, player.bow.damage, true)
          case e.axe:
            const [axe] = player.axes
            if (!axe) return
            game.attackEnemy(player, axe.damage)
            if (!collector.ended && axe.effect) game.enemy.addEffect(axe.effect)
            // i'd fling for axes too but i'm lazy lol
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
        game._endCollector(m, game._regen)
        if (reason === "time") {
          this.client.game = null
          return message.channel.send("Your team stopped responding, so you automatically lost.")
        }
        await message.channel.send("The Demon has been defeated!!!")
        game.reward(enemy.maxHP)
        setTimeout(() => this.gemRain(message), 5000)
      })
  }

  /** @param {import("discord.js").Message} message */
  async gemRain(message) {
    const { game } = this.client
    await message.channel.send("Wait, it's raining... gems?")
    const gems = [...25].map(() => this.client.util.generateGem(false, { rares: game.difficulty > 1 }))
    gems[Math.floor(Math.random() * gems.length)] = this.client.util.generateGem(true, { legendsOnly: true })

    const shuffled = this.client.config.emojis.gems.slice().sort(() => Math.random() - .5)
    gems.forEach((g, i) => {
      g.emoji = shuffled[i]
      g.collectedAt = null
      g.collectedBy = null
    })
    const remaining = gems.slice()

    const m = await message.channel.send(
      new Embed()
        .setTitle("Gem Rain")
        .setColor(this.client.colors.embed)
        .setDescription(`It's raining gems! Please wait while some gems fall from the sky. When they do, react to collect a gem before someone else does. Know that you have a cooldown of a few seconds after collecting a gem.`)
    )
    await m.react(remaining.first(5).map(g => g.emoji))
    const now = Date.now()
    const iEdit = setInterval(() => {
      const embed = new Embed()
        .setTitle("Gem Rain")
        .setColor(this.client.colors.color)
        .setDescription(`It's raining gems! Click on a gem to collect it.`)
        .addField(
          "Gems",
          remaining.map(gem => {
            if (gem.collectedAt) {
              if (Date.now() - gem.collectedAt < 3000) // collected less than 3 seconds ago
                return `${gem.emoji} | **${gem.collectedBy}**`
              else if (Date.now() - gem.collectedAt < 8000 || gem.isLegendary) // collected over 3s ago
                return `${gem.emoji} | **${gem.name}**`
              else remaining.remove(gem)
            } else if (m.reactions.cache.has(gem.emoji)) return `${gem.emoji} | ???`
          }).trim().join("\n")
        )
        .setFooter(`The gem rain will end in ${ms(300000 - (Date.now() - now))}.`)
      if (JSON.stringify(embed) === JSON.stringify(m.embed)) return Promise.resolve()
      return m.edit(embed)
    }, 2100)
    /** @returns {string[]} */ 
    const emojisLeft = () => remaining.filter(g => !g.collectedAt).map(g => g.emoji)
    const gen = remaining.slice(5).values()
    let i = 0
    const iGem = setInterval(() => {
      console.log(`adding gem reaction #${5+ ++i}`)
      if (m.reactions.cache.size === 20) {
        const r = m.reactions.cache.find(r => !emojisLeft().includes(r.emoji.name))
        if (r && message.channel.hasPermission(["READ_MESSAGES", "MANAGE_MESSAGES"])) r.remove().silence() // permission handling is stinky
        return
      }
      const next = gen.next()
      if (next.done) clearInterval(iGem)
      else m.react(next.value.emoji)
    }, 4000)

    const cooldowns = {}

    const collector = m.createReactionCollector(
      (r, user) => game.players.has(user.id) && !cooldowns[user.id] && emojisLeft().includes(r.emoji.name),
      { time: 300000 } // 5 minutes
    )

    collector.on("collect", async (r, user) => {
      const gem = remaining.find(g => g.emoji === r.emoji.name)
      if (gem.collectedAt) return
      gem.collectedAt = Date.now()
      gem.collectedBy = user.tag
      r.remove().silence()
      cooldowns[user.id] = true
      setTimeout(() => cooldowns[user.id] = false, 2000)
      const n = this.client.db.add(`${user.id}.inventory.gems.${gem.code}`, 1)
      await message.author.send(`You got a ${gem.name}! You now have ${n}.`).silence()
      if (gem.isLegendary) await message.channel.send(`**${user.username}** got a ${gem.name}!`)
      if (emojisLeft().length === 0) collector.stop()
    })

    collector.on("end", () => {
      clearInterval(iEdit)
      clearInterval(iGem)
      this.client.game = null
      message.channel.send("The gem rain has ended!")
    })
  }
}
