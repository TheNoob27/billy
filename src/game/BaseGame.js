const { Collection } = require("discord.js")
const Player = require("./Player")

class BaseGame {
  constructor(channel, host) {
    /**
     * The Client.
     * @type {import("../classes/Client")}
     */
    this.client = channel.client
    /**
     * The channel the game is in.
     * @type {import("discord.js").TextChannel}
     */
    this.channel = channel

    /**
     * A list of people in this game.
     * @type {Collection<string, import("./Player")>}
     */
    this.players = new Collection()
    /**
     * This game's host.
     */
    this.host = host ? this.addPlayer(host) : null

    /** @type {false} */
    this.versus = false
    this._regen = null
    this._collector = null
    this.ended = false // doesn't seem to be used lol
  }

  /**
   * The emojis the bot has to react with so people can attack.
   * @type {string[]}
   */
  get emojis() {
    // emojis used to attack
    return ["sword", "bow", "axe", "axe2", "magicMissile", "heal", "lifesteal", "fireball", "greaterFireball", "blink"]
      .filter((s, i) => {
        switch (i) {
          case 0: case 1: return true
          case 2: return this.players.some(p => p.axes.length)
          case 3: return this.players.some(p => p.axes.length > 1)
          case 9: if (this.versus) return false
          default: return this.players.some(p => p.spells.includes(s.toProperCase(true)))
        }
      }).map(n => this.client.config.emojis[n])
  }

  /**
   * The current message the bot is focusing on.
   * @type {import("discord.js").Message}
   */
  get message() {
    return this._collector && this._collector.message || null
  }

  /**
   * Add a player to this game.
   * @param {import("discord.js").User} user The user to add as a player.
   */
  addPlayer(user) {
    const player = new Player(user, this)
    this.players.set(user.id, player)
    if (user.id === this.host?.id) this.host = player
    return player
  }

  /**
   * Start the HP and Mana regeneration interval.
   */
  start() {
    this._regen = setInterval(() => {
      this.players.each(p => {
        p.heal(2 + Math.floor(p.level * 0.16)) // 2-10 hp regen
        if (p.mana < 100) p.mana = Math.min(p.mana + Math.floor(Math.random() * 3) + 1, 100) // regen 1-3 mana
      })
    }, 4000)
  }

  /**
   * Reward a player for defeating their opponent.
   * @param {string} id The ID of the player to reward with gems, gold and XP.
   * @param {number} hp The amount of HP the enemy/opponent had.
   */
  reward(id, hp = 100) {
    if (!this.players.has(id)) return
    console.log(id, "helped")
    const player = this.players.get(id)
    if (Math.random() > 0.6) {
      // used to be 0.75
      const gem = this.client.util.generateGem()
      this.players
        .get(id)
        .user.send(
          `You got a ${gem.name}! You now have ${this.client.db.add(`${player.id}.inventory.gems.${gem.code}`, 1)}.`
        )
        .silence()
    }

    console.log(
      "added gold:",
      this.client.db.add(`${player.id}.inventory.gold`, Math.ceil(hp / 16) + Math.ceil(player.level * 0.2))
    )
    const levelup = this.client.util.addXP(player.user, Math.ceil(hp / 25), this.channel)
    if (levelup) {
      player.level++
      player.hp = player.maxHP
    }
  }

  toString() {
    return this.playerList || "[Game]"
  }

  static get(name) {
    if (!name) return null
    const item = Object.values(BaseGame)
      .find(t => name in t)?.[name]
    return item ? { name, ...item } : null
  }
}

BaseGame.swords = {
  "Rusty Iron Sword": { damage: 6 },
  "Sharp Iron Sword": { damage: 8 },
  "Fine Steel Sword": { damage: 11 },
  "Power Katana": { damage: 13 },
  "Ice Blade": { damage: 15 },
  "Pure Energy": { damage: 24 },
  "Heaven's Edge": {
    damage: 30,
    effect: "💀", // smite
  },
}

BaseGame.axes = {
  "Axe of Skirmishing": {
    damage: 10,
  },
  "Battle Cleaver": {
    damage: 15,
  },
  "Flaming Fury": {
    damage: 16,
    effect: "🔥",
  },
  Venomancer: {
    damage: 20,
    effect: "🧪", // closest thing to poison
  },
}

BaseGame.spells = {
  "Magic Missile": {
    damage: 32,
    mana: 20,
  },
  Heal: {
    damage: 0,
    mana: 40,
    use(_, player) {
      const weakest = player.game.players
        .sorted((a, b) => a.hp - b.hp)
        .filter(p => p !== player && p.hp !== p.maxHP)
        .first()
      if (!weakest) return

      weakest.heal(115)
      return true
    },
  },
  Lifesteal: {
    damage: 75,
    mana: 45,
    use(enemy, player) {
      player.heal(Math.ceil(Math.random() * 30) + 50) // 50-80hp heal
      if (enemy.targetHits) enemy.targetHits += 5
      return true
    },
  },
  Fireball: {
    damage: 34,
    mana: 20,
  },
  "Greater Fireball": {
    damage: 43,
    mana: 45,
    effect: "🔥",
  },
  Blink: {
    damage: 0,
    mana: 30,
    use(enemy, player) {
      if (enemy.target === player) enemy.clearTarget()
      return true
    },
  },
}

BaseGame.bows = {
  "Legendary Bow": {
    damage: 30,
  },
  "Enchanted Crossbow": {
    damage: 15,
  },
  "Long Bow": {
    damage: 10,
  },
}

BaseGame.armour = {
  "Chain Armour": {
    health: 200,
  },
  "Knight Armour": {
    health: 190,
  },
  "Redcliff Elite Armour": {
    health: 170,
  },
  "Emperor Armour": {
    health: 160,
  },
  "Frost Guard Armour": {
    health: 110,
  },
  "Eternal Inferno": {
    health: 50,
    recoil: 0.15,
  },
}

module.exports = BaseGame
