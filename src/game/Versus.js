const BaseGame = require("./BaseGame")
const Embed = require("../classes/Embed")
const ms = require("pretty-ms")

class Versus extends BaseGame {
  constructor(channel, host) {
    super(channel, host)
    this.opponent = null
    this.started = false
    /** @type {true} */
    this.versus = true
  }

  get player() {
    return this.host
  }

  get enemy() {
    return this.opponent
  }

  opposite(player) {
    return player === this.player || player === this.player.id ? this.opponent : this.player
  }

  /**
   * Show info about a player.
   * @param {import("./Player")} player The player to show info about.
   * @returns {string}
   */
  playerInfo(player) {
    /*
      TheNoob27 >:( ;-;
      [###       ] 60/210HP
      [######### ] 90/100 Mana
    */
    const statuses = [
      this.client.config.emojis.oneHit,
      this.client.config.emojis.highestHP,
      this.client.config.emojis.lowestHP,
    ]
    const status = this.started
      ? statuses
          .filter((_, i) => {
            switch (i) {
              case 0:
                return player.spells
                  .map(BaseGame.get)
                  .concat(player.axes, player.bow, player.sword, { damage: player.damage /* cause why not */ })
                  .some(item => item.damage >= player.hp)
              case 1:
                const weakest = this.players.sorted((a, b) => a.hp - b.hp).first()
                return player === weakest && !this.players.every(p => p.hp === weakest.hp && p.hp !== p.maxHP)
              case 2:
                const strongest = this.players.sorted((a, b) => b.hp - a.hp).first()
                return player === strongest && !this.players.every(p => p.hp === strongest.hp && p.hp !== p.maxHP)
            }
          })
          .join(" ")
      : ""

    return `
      ${player.user.username} ${status}
      \`[${"#".repeat(player.hp > 0 ? Math.floor((player.hp / player.maxHP) * 10) || 1 : 0).padEnd(10, " ")}]\` ${Math.max(player.hp, 0)}/${player.maxHP}HP
      \`[${"#".repeat(player.mana > 0 ? Math.floor((player.mana / 100) * 10) || 1 : 0).padEnd(10, " ")}]\` ${player.mana} Mana
    `.stripIndents()
  }

  /**
   * Set the opponent of the versus match.
   */
  addPlayer(user) {
    const player = super.addPlayer(user)
    if (!this.started && this.player !== player) this.opponent = player
    return player
  }

  /**
   * Attack as a player.
   * @param {import("./Player")} player The player that's attacking.
   * @param {number} damage The damage to deal
   */
  attack(player, damage) {
    if (!this.started) return null
    const opponent = this.opposite(player)
    opponent.hp -= isNaN(damage) ? player.damage : damage
    if (opponent.armour.recoil) player.hp -= damage * player.armour.recoil
    const o = opponent === this.opponent
    if (opponent.hp <= 0) this.end(o ? "player" : "opponent")
    else if (player.hp <= 0) this.end(o ? "opponent" : "player")
    return this
  }

  /**
   * Attack the opponent with a spell.
   * @param {import("./Player")} player The player that is attacking.
   * @param {keyof (typeof Versus)["spells"]} spell The spell to use.
   */
  attackWithSpell(player, spell) {
    if (!this.started || !player.spells.includes(spell)) return
    const s = BaseGame.spells[spell]
    if (!s) return
    if (player.mana < s.mana || player._spellCooldowns[spell]) return

    const opponent = this.opposite(player)
    if (s.use && !s.use(opponent, player)) return
    player.mana = Math.max(0, player.mana - s.mana)
    if (s.effect) opponent.addEffect(s.effect)
    this.attack(player, s.damage)

    player._spellCooldowns[spell] = true
    setTimeout(() => delete player._spellCooldowns[spell], 5000)
    return this
  }

  end(r) {
    ["_fireInterval", "_poisonInterval", "_smiteInterval"].forEach(e => {
      clearInterval(this.player[e])
      clearInterval(this.opponent[e])
    })
    if (!this._collector.ended) this._collector.stop(r || "player")
  }

  start() {
    this.started = true
    super.start()
  }

  /**
   * Start the embed editing interval
   * @param {import("discord.js").Message} msg The message to repeatedly edit.
   */
  _embedInterval(msg) {
    if (!this.started) return;
    const now = Date.now()
    const timer = t => ms(Math.max(600000 - (t - now), 0))
    this._updateDamageInterval = setInterval(() => msg.edit(this._embed(timer)), 2100)
  }

  /**
   * Get the current embed.
   * @param {(d: number) => string} getTime Function to get the time left, from Date.now
   * @param {boolean} controls Show controls
   */
  _embed(getTime = () => ms(600000), controls = true) {
    const e = this.client.config.emojis
    return new Embed()
      .setTitle("Versus")
      .setColor(this.client.colors.color)
      .setDescription(
        controls
          ? `Press the ${e.sword} reaction to hit your opponent and the ${e.bow} to shoot them${
              this.emojis.includes(e.axe) ? `, and the ${e.axe} ${e.axe2} to use your axes` : ""
            }${this.emojis.length > 3 ? ", or the other reactions to perform various spells." : "."} You have ${getTime(
              Date.now()
            )}.`
          : ""
      )
      .addFields(
        [this.player, this.opponent]
          .trim(null)
          .map(p => ({ name: null, value: this.playerInfo(p), inline: true }))
      )
  }

  _endCollector() {
    clearInterval(this._regen)
    clearInterval(this._updateDamageInterval)
    this._collector = null
    this.channel.versus = null
  }
}

module.exports = Versus