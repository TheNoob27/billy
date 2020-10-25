class Player {
  constructor(user, game) {
    const data = this.client.db.get(user.id) || {}
    const inv = data.inventory || {}
    const level = data.level || { level: 1 }
    const armour = inv.armour || { health: 0 }
    
    this.raw = data

    /**
     * The game.
     * @type {import("./Game")}
     */
    this.game = game
    /**
     * The user this player is for.
     */
    this.user = user
    /**
     * The level of this player.
     * @type {number}
     */
    this.level = data.level && data.level.level || 1
    /**
     * The damage this player does.
     * @type {number}
     */
    this.damage = inv.sword && inv.sword.damage || 8
    /**
     * The HP this player currently has.
     * @type {number}
     */
    this.hp = 18 * (level.level - 1) + 100 + armour.health
    
    /**
     * The armour this player has.
     * @property {string} name The name of this armour.
     * @property {number} health The amount of health this armour has.
     * @type {object}
     */
    this.armour = armour
    /**
     * The bow this player has.
     * @property {string} name The name of this bow.
     * @property {number} damage The amount of damage this bow deals.
     * @type {object}
     */
    this.bow = inv.bow || { damage: 5 }
  }

  get id() {
    return this.user.id
  }

  get tag() {
    return this.user.tag
  }

  /**
   * The max HP this player can have.
   * @type {number}
   */
  get maxHP() {
    return 18 * (this.level - 1) + 100 + this.armour.health
  }

  attack(damage) {
    return this.game.attackEnemy(this, damage)
  }
  
  heal(hp) {
    if (isNaN(hp)) return this.hp
    this.hp += hp
    if (this.hp > this.maxHP) this.hp = this.maxHP
    return this.hp
  }

  refresh() {
    const p = new this.constructor(this.user, this.game)
    return Object.assign(this, p)
  }
}

module.exports = Player
