const { Collection } = require("discord.js")

class Game {
  constructor(client) {
    this.client = client
    
    this.players = new Collection()
    this.rounds = null
    this.team = null
    this.enemy = null
    this.enemyteam = []
    this.regen = null
    this.ended = false
  }
  
  addPlayer(user) {
    let data = this.client.fob.fetch(user.id);
    let inv = data.inv || {}
    let level = data.level || {}
    let sword = inv.sword || {}
    let armour = inv.armour || {}
    
    let push = {
      id: user.id,
      tag: user.tag,
      level: level.level,
      damage: inv.sword.damage || 8,
      hp: (18 * (level - 1) + 100) + (inv.armour.health || 0),
      maxhp: (18 * (level - 1) + 100) + (inv.armour.health || 0)
    }
    
    this.players.set(push.id, push)
    return this
  }
  
  removePlayer(user) {
    this.players.delete(user.id)
    return this
  }
  
  respawnPlayer(user, time = 7000) {
    this.players.delete(user.id)
    setTimeout(() => {
      this.addPlayer(user)
    }, time)
    
  }
  
  spawnEnemy(enemy) {
    
  }
}