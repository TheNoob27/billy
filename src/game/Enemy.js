class Enemy {
  constructor({ name, hp, damage } = {}, game) {
    /**
     * The game.
     * @type {import("./Game")}
     */
    this.game = game

    /**
     * Name of the enemy.
     * @type {string}
     */
    this.name = name
    /**
     * The amount of HP this enemy has.
     * @type {number}
     */
    this.hp = hp

    /**
     * The max amount of HP this enemy can have.
     * @type {number}
     */
    this.maxHP = hp
    /**
     * The amount of damage this enemy deals.
     * @type {number}
     */
    this.damage = damage

    /**
     * The current target the enemy would go for.
     * @type {import("./Player")}
     */
    this.target = null

    /**
     * The amount of times the enemy has hit the target. Note that if its archer, demon or mage the target won't change
     */
    this.targetHits = 0

    /**
     * Whether or not to wait before targeting someone new.
     */
    this.targetCooldown = false

    /**
     * The attacking interval.
     */
    this.targetInterval = null

    this.effects = []

    this.attackTarget = this.attackTarget.bind(this)

    /** @type {NodeJS.Timeout} */
    this._fireInterval
    /** @type {NodeJS.Timeout} */
    this._poisonInterval
    /** @type {NodeJS.Timeout} */
    this._smiteInterval

    if (this.demon) this.createTarget(this.game.players.random())
  }

  get general() { return this.name === "General" }
  get demon() { return this.name === "Demon" }

  get status() {
    return this.effects.join(" ")
  }

  toString() {
    return this.name
  }

  addEffect(effect) {
    if (this.hp <= 0) return
    if (!this.effects.includes(effect)) this.effects.push(effect)
    const handle = (name, dmg, limit = 10) => {
      if (this[`_${name}Interval`]) clearInterval(this[`_${name}Interval`])
      let n = 0
      this[`_${name}Interval`] = setInterval(() => {
        const res = this.game.attackEnemy(null, dmg, true)
        if (++n === limit || !res) {
          clearInterval(this[`_${name}Interval`])
          delete this[`_${name}Interval`]
        }
      }, 750)
    }
    switch (effect) {
      case this.game.client.config.emojis.fire:
        handle("fire", 10)
        break
      case this.game.client.config.emojis.poison:
        handle("poison", 12)
      case this.game.client.config.emojis.smite:
        handle("smite", 15, 3)
        break
    }
    return this
  }

  attack(player) {
    if (this.name === "Archer" && Math.random() > 0.9) return this.game
    return this.game.attackPlayer(player)
  }

  attacked(player, damage, noTarget = false) {
    this.hp -= isNaN(damage) ? player.damage : damage
    if (this.hp <= 0) return this.game.killEnemy()
    if (!this.target && !this.targetCooldown && (!noTarget || this.name === "Mage" || this.name === "Archer"))
      this.createTarget(player)
  }

  attackTarget() {
    if (!this.target) return this.clearTarget()
    if (Math.random() > 0.8) return // fair
    this.attack(this.target)
    this.targetHits++
    if (this.target.hp <= 0) this.clearTarget()
    else if (!["Demon", "Mage", "Archer"].includes(this.name) && this.targetHits > 4) this.clearTarget()
    else if (this.name === "Archer" && this.targetHits > 17) this.clearTarget()
  }

  createTarget(player) {
    if (this.targetCooldown) return;
    this.target = player
    this.targetHits = 0
    this.targetInterval = setInterval(this.attackTarget, 2000)
  }

  clearTarget() {
    this.target = null
    this.targetHits = 0
    clearInterval(this.targetInterval)
    this.targetCooldown = true
    setTimeout(() => this.targetCooldown = false, 5000)
  }
}

module.exports = Enemy
