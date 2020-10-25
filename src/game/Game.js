const { Collection } = require("discord.js")
const Embed = require("../classes/Embed")
const Enemy = require("./Enemy")
const Player = require("./Player")

class Game {
  constructor(channel) {
    /**
     * The Client.
     * @type {import("../classes/Client")}
     */
    this.client = channel.client
    /**
     * The channel the game is in.
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
     * @type {string}
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
     */
    this._helpers = []
    this.ended = false
  }

  get enemyTeam() {
    return Game.enemies(this.team.toLowerCase())
  }
  
  get emojis() {
    // emojis used to attack
    return [
      "⚔️", // sword
      "🏹", // bow
      "🪓", // axe
      
      "☄️", // magic missile
      "🩹", // heal 
      "🔮", // lifesteal
      "💥", // fireball
      "🔥", // greater fireball
      "⚡️", // blink
    ]
    .filter((_, i) => {
      let s;
      switch(i) {
        case 0: case 1: return true;
        case 2: return this.players.some(p => p.axe);
        case 3: s = "Magic Missile"; break;
        case 4: s = "Heal"; break;
        case 5: s = "Lifesteal"; break;
        case 6: s = "Fireball"; break;
        case 7: s = "Greater Fireball"; break;
        case 8: s = "Blink"; break;
      }
      return this.players.some(p => p.spells.includes(s))
    })
  }

  get message() {
    return this.collector && this.collector.message || null
  }

  get playerList() {
    const statuses = [
      "🎯", // targetted
      "😰", // one hit
      "🤕", // teamate with lowest hp
      "💪", // teammate with highest hp
    ]
    return this.players
    .map(player => {
      const status = statuses.filter((_, i) => {
        if (i > 1 && this.players.size === 1) return;
        switch(i) {
          case 0: return this.enemy && this.enemy.target = player;
          case 1: return this.enemy && this.enemy.damage > player.hp;
          case 2: return player === this.players.sorted((a, b) => a.hp - b.hp).first();
          case 3: return player === this.players.sorted((a, b) => b.hp - a.hp).first();
        })
      }).join(" ")
      `${status} **${player.tag}** - HP: ${player.hp < 0 ? 0 : player.hp}/${player.maxHP}`
    })
    .join("\n")
  }

  addPlayer(user) {
    const player = new Player(user, this)
    this.players.set(user.id, player)
    return player
  }

  attackEnemy(player, damage, noTarget) {
    if (!this.enemy || !this._collector) return null
    
    this.enemy.attacked(player, damage, noTarget)

    return this
  }
  
  attackWithSpell(player, spell) {
    if (!this.enemy) return;
    spell = Game.spells[spell]
    if (!spell) return;
    if (player.mana < spell.mana || player.spellCooldowns[spell]) return;
    
    if (spell.use && !spell.use(this.enemy, player)) return;
    this.attackEnemy(player, spell.damage, true)
    player.spellCooldowns[spell] = true
    setTimeout(() => delete player.spellCooldowns[spell], 2000)
    return this
  }

  attackPlayer(player, damage) {
    if (!this.enemy || !this._collector) return null
    
    damage = damage || this.enemy.damage
    player.hp -= damage
    if (player.armour.name == "Eternal Inferno") this.enemy.hp -= damage * 0.15
    
    if (player.hp <= 0) this.removePlayer(player)
    if (this.enemy.hp <= 0) this.killEnemy()
    return this
  }

  killEnemy() {
    this.enemy.clearTarget()
    this._collector.stop("enemyDied")
    // not setting enemy null here
  }

  removePlayer(user, autoend = true) {
    this.players.delete(user.id || user)
    
    if (this._collector && this.enemy && autoend) {
      this.channel.send("**" + user.tag + "** died!")
      if (this.players.size <= 0) return this._collector.stop("allDied")
    }
    return this
  }

  respawnPlayer(user, time = 7000, callback) {
    if (this.players.has(user.id)) this.players.delete(user.id)
    setTimeout(() => {
      const player = this.addPlayer(user)
      if (callback) callback(player)
    }, time)
    return this
  }

  reward(hp = this.enemy && this.enemy.hp || 100) {
    this._helpers.map(id => {
      if (!this.players.has(id)) return;
      const player = this.players.get(id)
      if (Math.random() > 0.6) { // used to be 0.75
        const gem = this.client.generateGem()
        this.players.get(id).user.send(`You got a ${gem.name}! You now have ${++player.raw.inventory.gems[gem.code]}.`).silence()
      }
      
      player.raw.inventory.gold += Math.ceil(hp / 16)
      let levelup = this.client.addXP(this.client.users.cache.get(id), Math.ceil(hp / 25), this.channel)
      if (levelup) {
        player.level++ // why refresh lol
      }
    })
    this._helpers.length = 0
    return this
  }

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
      this.players.each(p => p.heal(2 + Math.floor(p.level * 0.16))) // 2-10 hp regen
    }, 4000)

    return this
  }

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
  
    let e = enemy.name
    
    switch (e) {
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

  _embedInterval(msg) {
    if (!this.enemy) return;

    const now = Date.now()
    const time = (t) =>
      ms(
        (this.enemy.general ? 300000 : 180000) - (t - now) > 0
          ? (this.enemy.general ? 300000 : 180000) - (t - now)
          : "0s"
      )
    this._updateDamageInterval = setInterval(() => {
      msg.edit(
        new Embed()
        .setTitle("Field of Battle")
        .addField(`Enemy #${this.enemycount}`, `You and your team have encountered ${this.enemy.general ? `the **${this.enemy.name}**` : `a ${this.enemy.name}`}! Press the sword reaction to hit them, or the bow to shoot them. You have ${time(Date.now())}`)
        .addField("Enemy's HP", `${this.enemy.hp}/${this.enemy.maxHP}`)
        .addField("Your Team", this.playerList)
        .setColor(this.client.colors.color)
      )
    }, 2100)
  }

  _endCollector(msg, ...ints) {
    ints.forEach(clearInterval) // don't think i need this anymore
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
    msg = msg.edit(
      new Embed()
      .setTitle("Field of Battle")
      .addField(`Enemy #${this.enemycount}`, `You and your team have encountered ${this.enemy.general ? `the **${this.enemy.name}**` : `a ${this.enemy.name}`}! Press the sword reaction to hit them, or the bow to shoot them. You have 0s.`)
      .addField("Enemy's HP", this.enemy.hp > 0 ? `${this.enemy.hp}/${this.enemy.maxHP}` : `0/${this.enemy.maxHP}`)
      .addField("Your Team", this.playerList)
      .setColor(this.client.colors.color)
    )
    
    this.enemy = null
    this._collector = null
    
    return msg
  }
}

Game.enemies = {
  // human's enemies
  humans: ["Grunt", "Smasher", "Warrior", "Assassin", "Blademaster", "Elite Blademaster", "Warlord", "Tyrant", "Mage", "Archer", "KorKron Elite"],
  // orc's enemies
  orcs: ["Soldier", "Knight", "Assassin", "Captain", "Mage", "Archer", "Giant", "Guard", "Royal Guard"],
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
    damage: 25,
    mana: 20
  },
  "Greater Fireball": {
    damage: 40,
    mana: 45,
    use(enemy, player) {
      enemy.addEffect("🔥") // fire
      return true
    }
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

module.exports = Game
