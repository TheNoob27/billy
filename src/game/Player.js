const Enemy = require("./Enemy")

class Player {
  constructor(user, game) {
    const { constructor: Game } = game
    const data = game.client.db.get(user.id) || {}

    this.raw = data

    /**
     * The game.
     * @type {import("./Game") | import("./Versus")}
     */
    this.game = game
    /**
     * The user this player is for.
     * @type {import("discord.js").User}
     */
    this.user = user
    /**
     * The level of this player.
     * @type {number}
     */
    this.level = data.level?.level || 1
    /**
     * The damage this player does.
     * @type {number}
     */
    this.damage = Game.get(data.inventory?.sword || "Rusty Iron Sword")?.damage
    /**
     * The mana this player currently has.
     * @type {number}
     */
    this.mana = 100

    /**
     * The armour this player has.
     * @type {Armour}
     */
    this.armour = Game.get(data.inventory?.armour) || { health: 0 }
    /**
     * The HP this player currently has.
     * @type {number}
     */
    this.hp = 18 * (this.level - 1) + 100 + this.armour.health

    /**
     * The bow this player has.
     * @type {Bow}
     */
    this.bow = Game.get(data.inventory?.bow) || { damage: 5 }

    /**
     * The axes this player has.
     * @type {Axe[]}
     */
    this.axes = [].concat(data.inventory?.axes || []).map(Game.get).trim(null)

    /**
     * The list of spells this player has.
     * @type {(keyof (typeof import("./Game"))["spells"])[]}
     */
    this.spells = data.inventory?.spells || []

    this._spellCooldowns = {}

    /**
     * The player's difficulty.
     * @type {1 | 2 | 3}
     */
    this.difficulty = data.difficulty || 1

    this.effects = []
        /** @type {NodeJS.Timeout} */
    this._fireInterval
    /** @type {NodeJS.Timeout} */
    this._poisonInterval
    /** @type {NodeJS.Timeout} */
    this._smiteInterval

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

  /**
   * The sword this player has.
   * @type {Sword}
   */
  get sword() {
    return this.game.constructor.get(this.raw.inventory?.sword || "Rusty Iron Sword")
  }

  toString() {
    return this.tag
  }

  addEffect(effect) {
    if (!this.game.versus) return
    if (this.hp <= 0) return
    if (!this.effects.includes(effect)) this.effects.push(effect)
    const handle = (name, dmg, limit = 10) => {
      if (this[`_${name}Interval`]) clearInterval(this[`_${name}Interval`])
      let n = 0
      this[`_${name}Interval`] = setInterval(() => {
        const res = this.game.attack(this.game.opposite(this), dmg)
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
  }

  attack(damage) {
    return this.game[this.game.versus ? "attack" : "attackEnemy"](this, damage)
  }
  
  heal(hp) {
    if (isNaN(hp)) return this.hp
    this.hp += hp
    if (this.hp > this.maxHP) this.hp = this.maxHP
    return this.hp
  }

  refresh() {
    const p = new Player(this.user, this.game)
    return Object.assign(this, p)
  }

  /**
   * Add a stat to the user's stats.
   * @param {string} stat The stat to add.
   * @param {number} add The number to add.
   * @returns {number}
   */
  addStat(stat, add = 1) {
    if (isNaN(add)) return 0
    return this.game.client.db.add(`${this.id}.stats.${stat}`, add)
  }
}

module.exports = Player

/**
 * @typedef Armour
 * @property {string} name The name of this armour.
 * @property {number} health The amount of health this armour has.
 * @property {number} recoil The amount of damage the enemy will receive back.
 */
/**
 * @typedef Bow
 * @property {string} name The name of this bow.
 * @property {number} damage The amount of damage this bow deals.
 */
/**
 * @typedef Axe
 * @property {string} name The name of this axe.
 * @property {number} damage The amount of damage this axe deals.
 * @property {string} effect The effect this axe has.
 */
/**
 * @typedef Sword
 * @property {keyof (typeof import("./Game"))["swords"]} name The name of this sword.
 * @property {number} damage The amount of damage this sword does.
 * @property {string} effect The effect this sword has.
 */