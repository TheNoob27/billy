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
     */
    this.hp = hp

    /**
     * The max amount of HP this enemy can have.
     */
    this.maxHP = hp
    /**
     * The amount of damage this enemy deals.
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

    this.attackTarget = this.attackTarget.bind(this)
  }

  get general() { return this.name === "General" }
  get demon() { return this.name === "Demon" }
  
  attack(player) {
    return this.game.attackPlayer(player)
  }

  attacked(player, damage) {
    this.hp -= damage || player.damage
    if (this.hp <= 0) return this.game.killEnemy()
    if (!this.target && !this.targetCooldown) this.createTarget(player)
  }

  attackTarget() {
    if (!this.target) return this.clearTarget()
    this.attack(player)
    this.targetHits++
    if (!["Demon", "Mage", "Archer"].includes(this.name) && this.targetHits > 4) this.clearTarget()
    else if (this.name === "Archer" && this.targetHits > 17) this.clearTarget
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
