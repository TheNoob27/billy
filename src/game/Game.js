const { Collection } = require("discord.js")
const Embed = require("../classes/Embed")
const Enemy = require("./Enemy")
const Player = require("./Player")
const ms = require("pretty-ms")

class Game {
  constructor(channel) {
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
     * The amount of enemies players will fight.
     */
    this.rounds = Math.ceil(Math.random() * 5) + 5 // 5-10
    /**
     * The name of the team the players are on.
     * @type {"Humans" | "Orcs"}
     */
    this.team = ["Humans", "Orcs"].random()
    /**
     * The current enemy the team is fighting.
     */
    this.enemy = null
    /**
     * The amount of enemies the team have fought.
     */
    this.enemyCount = 0

    this._regen = null
    this._collector = null
    /**
     * A list of IDs of people who helped defeat the last enemy.
     * @type {string[]}
     */
    this._helpers = []
    this.ended = false
  }

  get config() {
    return this.client.config
  }

  /**
   * The enemy team.
   * @type {string[]}
   */
  get enemyTeam() {
    return Game.enemies[this.team.toLowerCase()]
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

  get shouldSpawnDemon() {
    return this.players.size > 1 && Math.random() > 0.5
  }

  get shouldSpawnGeneral() {
    return this.enemyCount + 1 === this.rounds
  }

  get fightingDemon() {
    return this.enemy ? this.enemy.demon : this.enemyCount === this.rounds + 1
  }

  get time() {
    switch (this.enemy.name) {
      case "General": return 300000
      case "Demon": return 600000
      default: return 180000
    }
  }

  /** The list of players */
  get playerList() {
    const statuses = [
      this.client.config.emojis.targeted, // targeted
      this.client.config.emojis.oneHit, // one hit
      this.client.config.emojis.lowestHP, // teamate with lowest hp
      this.client.config.emojis.highestHP, // teammate with highest hp
    ]
    
    return this.players
    .map(player => {
      const status = statuses.filter((_, i) => {
        if (i > 1 && this.players.size === 1) return;
        switch(i) {
          case 0: return this.enemy && this.enemy.target === player;
          case 1: return this.enemy && this.enemy.damage > player.hp;
          case 2:
            const weakest = this.players.sorted((a, b) => a.hp - b.hp).first()
            return player === weakest && !this.players.every(p => p.hp === weakest.hp)
          case 3:
            const strongest = this.players.sorted((a, b) => b.hp - a.hp).first()
            return player === strongest && !this.players.every(p => p.hp === strongest.hp)
        }
      }).concat("").join(" ")
      return `${status}**${player.tag}** - HP: ${player.hp < 0 ? 0 : player.hp}/${player.maxHP}${
        player.spells.length ? ` Mana: ${player.mana}/100` : ""
      }`
    })
    .join("\n")
  }

  /**
   * Add a player to this game.
   * @param {import("discord.js").User} user The user to add as a player.
   */
  addPlayer(user) {
    const player = new Player(user, this)
    this.players.set(user.id, player)
    return player
  }

  /**
   * Attack the current enemy.
   * @param {Player} player The player that is attacking.
   * @param {number} damage The damage to deal.
   * @param {boolean} noTarget Don't target the player if able to.
   */
  attackEnemy(player, damage, noTarget = false) {
    if (!this.enemy || !this._collector) return null
    this.enemy.attacked(player, damage, noTarget)
    if (player && !this._helpers.includes(player.id)) this._helpers.push(player.id)
    return this
  }

  /**
   * Attack the enemy with a spell.
   * @param {Player} player The player that is attacking.
   * @param {keyof (typeof Game)["spells"]} spell The spell to use.
   */
  attackWithSpell(player, spell) {
    if (!this.enemy || !player.spells.includes(spell)) return;
    const s = Game.spells[spell]
    if (!s) return;
    if (player.mana < s.mana || player._spellCooldowns[spell]) return;
    
    if (s.use && !s.use(this.enemy, player)) return;
    player.mana = Math.max(0, player.mana - s.mana)
    if (s.effect) this.enemy.addEffect(s.effect)
    this.attackEnemy(player, s.damage, true)
    
    player._spellCooldowns[spell] = true
    setTimeout(() => delete player._spellCooldowns[spell], 5000)
    return this
  }

  /**
   * Have the enemy attack a player.
   * @param {Player} player The player to attack.
   * @param {number} damage The damage to deal.
   */
  attackPlayer(player, damage) {
    if (!this.enemy || !this._collector) return null
    
    damage = damage || this.enemy.damage
    player.hp -= damage
    if (player.armour.recoil) this.enemy.hp -= damage * player.armour.recoil
    
    if (player.hp <= 0)
      !this.fightingDemon
        ? this.removePlayer(player)
        : this.respawnPlayer(player.user, 7 + Math.floor(player.level * 0.1) * 1000)
    if (this.enemy?.hp <= 0) this.killEnemy() // enemy isn't present if last player died
    return this
  }

  /** Clear up stuff after killing the enemy. */
  killEnemy() {
    [this.enemy._fireInterval, this.enemy._poisonInterval, this.enemy._smiteInterval].forEach(clearInterval)
    this.enemy.clearTarget()
    this._collector.stop("enemyDied")
    // not setting enemy null here
  }

  /**
   * Remove a player from the game, after they died.
   * @param {import("discord.js").User} user The user to remove.
   * @param {boolean} autoEnd Automatically end the game if everyone is dead.
   */
  removePlayer(user, autoEnd = true) {
    this.players.delete(user.id || user)
    if (this._collector && this.enemy && autoEnd) {
      this.channel.send(`**${user.tag}** died!`)
      if (this.players.size <= 0) this._collector.stop("allDied")
    }
    return this
  }

  /**
   * Respawn a player.
   * @param {import("discord.js").User} user The user to respawn.
   * @param {number} time The time to wait before respawning them.
   * @param {(player: Player) => void} callback A callback that runs after they've respawned.
   * @param {boolean} announce Announce that they will respawn.
   */
  respawnPlayer(user, time = 7000, callback, announce = true) {
    if (this.players.has(user.id)) {
      this.players.delete(user.id)
      if (this._collector && this.enemy && announce)
        this.channel.send(`**${user.tag}** died! They respawn in ${ms(time)} seconds.`)
    }
    setTimeout(() => {
      const player = this.addPlayer(user)
      if (typeof callback === "function") callback(player)
    }, time)
    return this
  }

  /**
   * Award everyone who helped kill the enemy.
   * @param {number} hp The amount of HP the enemy had.
   */
  reward(hp = this.enemy?.maxHP || 100) {
    this._helpers.map(id => {
      if (!this.players.has(id)) return;
      console.log(id, "helped")
      const player = this.players.get(id)
      if (Math.random() > 0.6) { // used to be 0.75
        const gem = this.client.util.generateGem()
        this.players.get(id).user.send(`You got a ${gem.name}! You now have ${this.client.db.add(`${player.id}.inventory.gems.${gem.code}`, 1)}.`).silence()
      }
      
      console.log("added gold:", this.client.db.add(`${player.id}.inventory.gold`, Math.ceil(hp / 16) + Math.ceil(player.level * 0.2)))
      const levelup = this.client.util.addXP(player.user, Math.ceil(hp / 25), this.channel)
      if (levelup) {
        player.level++
        player.hp = player.maxHP
      }
    })
    this._helpers.length = 0
    return this
  }

  /**
   * Start the game.
   */
  start() {
    this.players.initial = [...this.players.keys()]
    this.channel.send(
      new Embed()
      .setTitle("Game Starting!")
      .addField("Team", this.team, true)
      .addField("Enemies", this.rounds, true)
      .addField("Players", `**${this.players.map(p => p.user.tag).join("\n")}**`)
      .setColor(this.client.colors.color)
      .setTimestamp()
    )

    this._regen = setInterval(() => { 
      this.players.each(p => {
        p.heal(2 + Math.floor(p.level * 0.16)) // 2-10 hp regen
        if (p.mana < 100)
          p.mana = Math.min(p.mana + Math.floor(Math.random() * 3) + 1, 100) // regen 1-3 mana
      })
    }, 4000)

    return this
  }

  /**
   * Spawn an enemy.
   * @param {string} enemy The name of the enemy to spawn.
   * @returns {Enemy}
   */
  spawnEnemy(enemy) {
    this.enemyCount++
    
    if (enemy && typeof enemy === "object") {
      this.enemy = new Enemy(enemy, this)
      return this.enemy
    }
    
    enemy = {
      name: typeof enemy === "string" ? enemy : this.enemyTeam.random(),
      hp: null,
      damage: null
    }    
  
    
    switch (enemy.name) {
      case "Soldier": case "Grunt": {
        enemy.hp = 100
        enemy.damage = 11
        break;
      } 
      case "Mage": {
        enemy.hp = 135
        enemy.damage = 16
        break;
      } 
      case "Archer": {
        enemy.hp = 145
        enemy.damage = 15
        break;
      } 
      case "Knight": case "Smasher": {
        enemy.hp = 169
        enemy.damage = 18
        break;
      } 
      case "Captain": case "Warrior": {
        enemy.hp = 195
        enemy.damage = 22
        break;
      } 
      case "Blademaster": {
        enemy.hp = 210
        enemy.damage = 25
        break;
      } 
      case "Guard": case "Elite Blademaster": {
        enemy.hp = 235
        enemy.damage = 27
        break;
      } 
      case "Assassin": {
        enemy.hp = 240
        enemy.damage = 28
        break;
      } 
      case "Warlord": {
        enemy.hp = 250
        enemy.damage = 28
        break;
      } 
      case "Tyrant": case "Giant": {
        enemy.hp = 405
        enemy.damage = 33
        break;
      } 
      case "KorKron Elite": case "Royal Guard": {
        enemy.hp = 300
        enemy.damage = 40
        break;
      }

      case "General": {
        enemy.hp = 1162
        enemy.damage = 45
        break;
      }
      case "Demon": {
        enemy.hp = 1882
        enemy.damage = 66
        break;
      }

      default: {
        return this.spawnEnemy(void this.enemyCount--)
      }
    }

    this.enemy = new Enemy(enemy, this)
    return this.enemy
  }

  /**
   * Start the embed editing interval
   * @param {import("discord.js").Message} msg The message to repeatedly edit.
   */
  _embedInterval(msg) {
    if (!this.enemy) return;

    const now = Date.now()
    const timer = t => ms(Math.max(this.time - (t - now), 0))
    this._updateDamageInterval = setInterval(() => {
      if (this.fightingDemon) {
        const unluckyOne = this.players.random()
        if (unluckyOne) this.attackPlayer(unluckyOne, 10)
      }
      msg.edit(this._embed(timer))
    }, 2100)
  }

  /**
   * Get the current embed.
   * @param {(d: number) => string} getTime Function to get the time left, from Date.now
   * @param {boolean} controls Show controls
   */
  _embed(getTime = () => ms(this.time), controls = true) { // 5m for gen, 3m for else
    const e = this.client.config.emojis
    return new Embed()
      .setTitle("Field of Battle")
      .addField(
        `Enemy #${this.enemyCount}`,
        `${
          !this.enemy.demon
            ? `You and your team have encountered ${
                this.enemy.general ? `the **${this.enemy.name}**` : `a ${this.enemy.name}`
              }! `
            : "**A GIANT DEMON SPAWN APPEARED!!**\n\n"
        }${
          controls
            ? `Press the ${e.sword} reaction to hit them and the ${e.bow} to shoot them${
                this.emojis.includes(e.axe) ? `, and the ${e.axe} ${e.axe2} to use your axes` : ""
              }${
                this.emojis.length > 3 ? ", or the other reactions to perform various spells" : "."
              } You have ${getTime(Date.now())}.`
            : ""
        }`
      )
      .addField(this.enemy.demon ? "Demon's HP" : "Enemy's HP", `${Math.max(this.enemy.hp, 0)}/${this.enemy.maxHP}HP ${this.enemy.status}`)
      .addField("Your Team", this.playerList)
      .setColor(this.enemy.demon ? "#632f2f" : this.client.colors.color)
  }

  /**
   * Clean up after ending the collector.
   * @param {import("discord.js").Message} msg The message to edit.
   */
  _endCollector(msg, ...ints) {
    ints.forEach(clearInterval)
    clearInterval(this._updateDamageInterval)
    
    // this.fightingDemon ?
    //   msg.edit(
    //   new RichEmbed()
    //   .setTitle("Field of Battle")
    //   .setDescription("**The Demon has been defeated!!**")
    //   .addField("Demon's HP", "0/" + hp)
    //   .addField("Your Team", "​"+ this.players.map(player => "**"+player.tag+"** - HP: "+ (player.hp < 0 ? 0 : player.hp)).join("\n"))
    //   .setColor(this.client.config.color)
    // ) :
    msg.edit(this._embed(() => "0s", false))
    
    this.enemy = null
    this._collector = null
    
    return msg
  }

  toString() {
    return this.playerList
  }

  static get(name) {
    if (!name) return null
    const item = Object.values(Game)
      .slice(1) // slice enemies obj
      .find(t => name in t)?.[name]
    return item ? { name, ...item } : null
  }
}

Game.enemies = {
  // human's enemies
  humans: ["Grunt", "Smasher", "Warrior", "Assassin", "Blademaster", "Elite Blademaster", "Warlord", "Tyrant", "Mage", "Archer", "KorKron Elite"],
  // orc's enemies
  orcs: ["Soldier", "Knight", "Assassin", "Captain", "Mage", "Archer", "Giant", "Guard", "Royal Guard"],
}

// todo rusty iron sword
Game.swords = {
  "Rusty Iron Sword": { damage: 6 },
  "Sharp Iron Sword": { damage: 8 },
  "Fine Steel Sword": { damage: 11 },
  "Power Katana": { damage: 13 },
  "Ice Blade": { damage: 15 },
  "Pure Energy": { damage: 24 },
  "Heaven's Edge": {
    damage: 30,
    effect: "💀" // smite
  }
}

Game.axes = {
  "Axe of Skirmishing": {
    damage: 10
  },
  "Battle Cleaver": {
    damage: 15
  },
  "Flaming Fury": {
    damage: 16,
    effect: "🔥",
  },
  "Venomancer": {
    damage: 20,
    effect: "🧪" // closest thing to poison
  }
}

Game.spells = {
  "Magic Missile": {
    damage: 32,
    mana: 20
  },
  "Heal": {
    damage: 0,
    mana: 40,
    use(_, player) {
      const weakest = player.game.players
      .sorted((a, b) => a.hp - b.hp)
      .filter(p => p !== player && p.hp !== p.maxHP)
      .first()
      if (!weakest) return;
      
      weakest.heal(115)
      return true
    }
  },
  "Lifesteal": {
    damage: 75,
    mana: 45,
    use(_, player) {
      player.heal(Math.ceil(Math.random() * 30) + 50) // 50-80hp heal
      return true
    }
  },
  "Fireball": {
    damage: 34,
    mana: 20
  },
  "Greater Fireball": {
    damage: 43,
    mana: 45,
    effect: "🔥"
  },
  "Blink": {
    damage: 0,
    mana: 30,
    use(enemy, player) {
      if (enemy.target === player) enemy.clearTarget()
      return true
    }
  },
}

Game.bows = {
  "Legendary Bow": {
    damage: 30
  },
  "Enchanted Crossbow": {
    damage: 15
  },
  "Long Bow": {
    damage: 10
  },
}

Game.armour = {
  "Chain Armour": {
    health: 200
  },
  "Knight Armour": {
    health: 190
  },
  "Redcliff Elite Armour": {
    health: 170
  },
  "Emperor Armour": {
    health: 160
  },
  "Frost Guard Armour": {
    health: 110
  },
  "Eternal Inferno": {
    health: 50,
    recoil: .15,
  },
}

module.exports = Game
