const { Collection, RichEmbed } = require("discord.js")

module.exports = class Game {
  constructor(channel) {
    this.client = channel.client
    this.channel = channel
    
    this.players = new Collection()
    this.rounds = 0
    this.team = null
    this.enemy = null
    this.enemycount = 0
    this.enemyteam = []
    this.regen = null
    this.collector = null
    this.ended = false
    
    return this
  }
  
  get fightingDemon() {
    return this.enemy ? this.enemy.name == "Demon" : false
  }
  
  get shouldSpawnDemon() {
    return this.players.size > 1 && Math.random() < 14.3
  }
  
  get shouldSpawnGeneral() {
    return this.enemycount + 1 == this.rounds
  }
  
  init(demon = false) {
    if (!demon) {
      let rounds = Math.ceil(Math.random() * 5) + 5
      this.rounds = rounds
      let teams = ["Humans", "Orcs"]
      this.team = teams[Math.floor(Math.random() * teams.length)]
      let orcs = ["Grunt", "Smasher", "Warrior", "Assassin", "Blademaster", "Elite Blademaster", "Warlord", "Tyrant", "Mage", "Archer", "KorKron Elite"] //orcs
      let humans = ["Soldier", "Knight", "Assassin", "Captain", "Mage", "Archer", "Giant", "Guard", "Royal Guard"] // humans
      this.enemyteam = this.team == "Humans" ? orcs : humans
    
      this.channel.send(
        new RichEmbed()
          .setTitle("Game Starting!")
          .addField("Team", this.team)
          .addField("Enemies", this.rounds)
          .addField("Players", "**"+ this.players.map(p => p.tag).join("\n") +"**")
          .setColor(this.client.config.color)
          .setTimestamp()
        )
    }
    
    this.cachePlayers()
    
    let times = 0
    this.regen = setInterval(() => { 
      console.log("Regen number "+ ++times)
      this.players.forEach(p => {
        if (p.hp < p.maxhp) p.hp += 2
        if (p.hp > p.maxhp) p.hp = p.maxhp
      })
    }, 4000)

    return this
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
    let armour = inv.armour || {health: 0}
    
    let push = {
      user: user,
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
  
  removePlayer(user, autoend = true) {
    this.players.delete(user.id)
    
    if (this.collector && this.enemy && autoend) {
      this.channel.send("**" + user.tag + "** died!")
      if (this.players.size <= 0) return this.collector.stop("alldied")
    }
    return this
  }
  
  respawnPlayer(user, time = 7000, callback) {
    if (this.players.has(user.id)) this.players.delete(user.id)
    setTimeout(() => {
      this.addPlayer(user)
      if (callback) callback(this.players.get(user.id))
    }, time)
    return this
  }

  attackEnemy(player, damage) {
    if (!this.enemy || !this.collector) return null
    
    this.enemy.hp -= damage ? damage : player.damage
    if (this.enemy.hp <= 0) return this.collector.stop("enemydied")
    
    return this
  }
  
  attackPlayer(player, damage) {
    if (!this.enemy || !this.collector) return null
    
    let dmg = damage ? damage : this.enemy.damage
    player.hp -= dmg
    if (player.armour.name == "Eternal Inferno") this.enemy.hp -= dmg * 0.15
    
    if (player.hp <= 0 && !this.fightingDemon) this.removePlayer(player)
    if (this.enemy.hp <= 0) this.collector.stop("enemydied")
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
  
  endCollector(msg, hp, ...ints) {
    ints.forEach(i => clearInterval(i))
    
    this.fightingDemon ?
      msg.edit(
      new RichEmbed()
      .setTitle("Field of Battle")
      .setDescription("**The Demon has been defeated!!**")
      .addField("Demon's HP", "0/" + hp)
      .addField("Your Team", "​"+ this.players.map(player => "**"+player.tag+"** - HP: "+ (player.hp < 0 ? 0 : player.hp)).join("\n"))
      .setColor(this.client.config.color)
    ) :
    msg.edit(
      new RichEmbed()
      .setTitle("Field of Battle")
      .addField("Enemy #" + this.enemycount, "You and your team have encountered " + (this.enemy.name == "General" ? "the **" + this.enemy.name + "**" : "a "+ this.enemy.name) + "! Press the sword reaction to hit him. You have " + (this.enemy.name == "General" ? "5" : "3") +" minutes.")
      .addField("Enemy's HP", this.enemy.hp > 0 ? this.enemy.hp + "/" + hp : "0/" + hp)
      .addField("Your Team", "​"+ this.players.map(player => "**"+player.tag+"** - HP: "+ (player.hp < 0 ? 0 : player.hp)).join("\n"))
      .setColor(this.client.config.color)
    )
    
    this.enemy = null
    this.collector = null
    
    return msg
  }
  
  reward(helpers, hp) {
    helpers.forEach(user => {
      if (!this.players.has(user)) return;
      if (Math.random() > 0.75) {
        let gem = this.client.generateGem()
      
        this.client.fob.add(`${user}.inventory.gems.${gem.code}`, 1)
        this.players.get(user).user.send("You got a "+gem.name+"! You now have "+ (this.client.fob.fetch(`${user}.inventory.gems.${gem.code}`)) + ".")
      }
      
      this.client.fob.add(`${user}.inventory.gold`, Math.ceil(hp / 16))
      let levelup = this.client.addXP(this.client.users.get(user), Math.ceil(hp / 25), this.channel)
      if (levelup) {
        let player = this.players.get(user)
        player.level++
        player.hp = (18 * (player.level - 1) + 100)
        player.maxhp = (18 * (player.level - 1) + 100)
      }
    })
  }
}
