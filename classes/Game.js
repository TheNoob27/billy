class Game {
  constructor(client) {
    this.client = client
    
    this.players = []
    this.playerlist = []
    this.rounds = null
    this.team = null
    this.enemyteam = []
    this.regen = null
    this.ended = false
  }
  
  addPlayer(user) {
    let level = this.client.fob.fetch(`${user.id}.level.level`) || 1
    let dmg = this.client.fob.fetch(`${user.id}.inventory.sword.damage`) || 11
    this.players.push({
      id: user.id,
      level: level,
      hp: (18 * (level - 1) + 100),
      tag: user.tag,
      damage: dmg,
      maxhp: (18 * (level - 1) + 100)
    })
    this.playerlist.push(user.id)
  }
}