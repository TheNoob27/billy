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
    return this.constructor.enemies(this.team.toLowerCase())
  }

  get playerList() {
    return this.players
    .map(player => `**${player.tag}** - HP: ${player.hp < 0 ? 0 : player.hp}/${player.maxHP}`)
    .join("\n")
    .concat("\u200b")
  }

  addPlayer(user) {
    const player = new Player(user, this)
    this.players.set(user.id, player)
    return player
  }

  attackEnemy(player, damage) {
    if (!this.enemy || !this._collector) return null
    
    this.enemy.attacked(player, damage)

    return this
  }

  attackPlayer(player, damage) {
    if (!this.enemy || !this.collector) return null
    
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
      this.players.each(p => {
        if (p.hp < p.maxHP) p.hp += 2
        if (p.hp > p.maxHP) p.hp = p.maxHP
      })
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
        (general ? 300000 : 180000) - (t - now) > 0
          ? (general ? 300000 : 180000) - (t - now)
          : "0s"
      )
    this._updateDamageInterval = setInterval(() => {
      msg.edit(
        new Embed()
        .setTitle("Field of Battle")
        .addField(`Enemy #${this.enemycount}`, `You and your team have encountered ${this.enemy.name === "General" ? `the **${this.enemy.name}**` : `a ${this.enemy.name}`}! Press the sword reaction to hit them, or the bow to shoot them. You have ${time(Date.now())}`)
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
      .addField(`Enemy #${this.enemycount}`, `You and your team have encountered ${this.enemy.name === "General" ? `the **${this.enemy.name}**` : `a ${this.enemy.name}`}! Press the sword reaction to hit them, or the bow to shoot them. You have 0s.`)
      .addField("Enemy's HP", this.enemy.hp > 0 ? `${this.enemy.hp}/${this.enemy.maxHP}` : `0/${this.enemy.maxHP}`)
      .addField("Your Team", this.playerList)
      .setColor(this.client.colors.color)
    )
    
    this.enemy = null
    this._collector = null
    
    return msg
  }
}

Game.constructor.enemies = {
  // human's enemies
  humans: ["Grunt", "Smasher", "Warrior", "Assassin", "Blademaster", "Elite Blademaster", "Warlord", "Tyrant", "Mage", "Archer", "KorKron Elite"],
  // orc's enemies
  orcs: ["Soldier", "Knight", "Assassin", "Captain", "Mage", "Archer", "Giant", "Guard", "Royal Guard"],
}

module.exports = Game