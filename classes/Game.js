const { Collection, RichEmbed } = require("discord.js")

module.exports = class Game {
  constructor(client) {
    this.client = client
    
    this.players = new Collection()
    this.rounds = null
    this.team = null
    this.enemy = null
    this.enemycount = 0
    this.enemyteam = []
    this.regen = null
    this.collector = null
    this.ended = false
    
    return this
  }
  
  init(channel) {
    let rounds = Math.ceil(Math.random() * 5) + 5
    this.rounds = rounds
    let teams = ["Humans", "Orcs"]
    this.team = teams[Math.floor(Math.random() * teams.length)]
    let orcs = ["Grunt", "Smasher", "Warrior", "Assassin", "Blademaster", "Elite Blademaster", "Warlord", "Tyrant", "Mage", "Archer", "KorKron Elite"] //orcs
    let humans = ["Soldier", "Knight", "Assassin", "Captain", "Mage", "Archer", "Giant", "Guard", "Royal Guard"] // humans
    this.enemyteam = this.team == "Humans" ? orcs : humans
    
    this.cachePlayers()
    
    channel.send(
      new RichEmbed()
        .setTitle("Game Starting!")
        .addField("Team", this.team)
        .addField("Enemies", this.rounds)
        .addField("Players", "**"+ this.players.map(p => p.tag).join("\n") +"**")
        .setColor(this.client.config.color)
        .setTimestamp()
      )
    
    let times = 0
    this.regen = setInterval(() => { 
      console.log("Regen number "+ ++times)
      this.players.forEach(p => {
        if (p.hp < p.maxhp) p.hp += 2
        if (p.hp > p.maxhp) p.hp = p.maxhp
      })
    }, 4000)
  }
  
  cachePlayers() {
    this.playerCache = this.players.clone()
    return this
  }
  
  addPlayer(user) {
    let data = this.client.fob.fetch(user.id);
    let inv = data.inventory || {}
    let level = data.level || {}
    let sword = inv.sword || {}
    let armour = inv.armour || {}
    
    let push = {
      id: user.id,
      tag: user.tag,
      level: level.level,
      damage: sword.damage || 8,
      hp: (18 * (level.level - 1) + 100) + (armour.health || 0),
      maxhp: (18 * (level.level - 1) + 100) + (armour.health || 0),
      armour: armour
    }
    
    this.players.set(push.id, push)
    return this
  }
  
  removePlayer(user) {
    this.players.delete(user.id)
    
    if (this.collector && this.enemy) {
      if (this.players.size <= 0) return this.collector.stop("alldead")
    }
    return this
  }
  
  respawnPlayer(user, time = 7000) {
    if (this.players.has(user.id)) this.players.delete(user.id)
    setTimeout(() => {
      this.addPlayer(user)
    }, time)
    return this
  }

  attackEnemy(player) {
    if (!this.enemy || !this.collector) return null
    
    this.enemy.hp -= player.damage
    if (this.enemy.hp <= 0) return this.collector.stop("dead")
    
    return this
  }
  
  attackPlayer(player) {
    if (!this.enemy || !this.collector) return null
    
    player.hp -= this.enemy.damage
    if (player.armour.name == "Eternal Inferno") this.enemy.hp -= this.enemy.damage * 0.15
    
    if (player.hp <= 0) this.removePlayer(player)
    if (this.enemy.hp <= 0) this.collector.stop("dead")
    return this
  }
  
  spawnEnemy(enemy) {
    this.enemycount++
    
    if (enemy) {
      this.enemy = enemy
      return this.enemy
    }
    
    enemy = {
      name: null,
      hp: null,
      damage: null
    }
    
    let enemies = this.enemyteam
    enemy.name = enemies[Math.floor(Math.random() * enemies.length)]
    
  
    let e = enemy.name
    
    if (e == "Soldier" || e == "Grunt") {
      enemy.hp = 100
      enemy.damage = 11
    } else if (e == "Mage") {
      enemy.hp = 135
      enemy.damage = 16
    } else if (e == "Archer") {
      enemy.hp = 145
      enemy.damage = 15
    } else if (e == "Knight" || e == "Smasher") {
      enemy.hp = 169
      enemy.damage = 18
    } else if (e == "Captain" || e == "Warrior") {
      enemy.hp = 195
      enemy.damage = 22
    } else if (e == "Blademaster") {
      enemy.hp = 210
      enemy.damage = 25
    } else if (e == "Guard" || e == "Elite Blademaster") {
      enemy.hp = 235
      enemy.damage = 27
    } else if (e == "Assassin") {
      enemy.hp = 240
      enemy.damage = 28
    } else if (e == "Warlord") {
      enemy.hp = 250
      enemy.damage = 28
    } else if (e == "Tyrant" || e == "Giant") {
      enemy.hp = 405
      enemy.damage = 33
    } else if (e == "KorKron Elite" || e == "Royal Guard") {
      enemy.hp = 300
      enemy.damage = 40
    }
    
    this.enemy = enemy
    
    return this.enemy
  }
}