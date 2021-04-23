class Trade {
  constructor(client, trader, tradingWith) {
    /** @type {import("./Client")} */
    this.client = client
    /** @type {import("discord.js").User} */
    this.trader = trader
    /** @type {import("discord.js").User} */
    this.tradingWith = tradingWith
    this.state = {
      trader: new TradeState(this),
      tradingWith: new TradeState(this)
    }
  }

  get accepted() {
    return this.state.trader.accepted && this.state.tradingWith.accepted
  }

  /**
   * Get the trading state for a user who's in this trade.
   * @param {import("discord.js").User} user The user - either the trader or the one trading with.
   */
  getState(user) {
    return user.id === this.trader.id || user === this.trader.id ? this.state.trader : this.state.tradingWith
  }

  /**
   * Called automatically when someone adds or removes an item.
   */
  modified() {
    this.state.trader.accepted = false
    this.state.tradingWith.accepted = false
    this.check()
  }

  /**
   * Check both states to see if they have the required amount of items, if not then lower it.
   */
  check() {
    for (const i of ["trader", "tradingWith"]) {
      const user = this[i]
      /** @type {TradeState} */
      const state = this.state[i]
      const inv = this.client.db.get(`${user.id}.inventory`) // maybe i shouldn't be fetching every time
      if (!inv) state.empty()
      else {
        for (const gCode in state.gems) {
          if (!inv.gems?.[gCode]) delete state.gems[gCode]
          else if (inv.gems[gCode] < state.gems[gCode]) state.gems[gCode] = inv.gems[gCode]
          else if (state.gems[gCode] === 0) delete state.gems[gCode]
        }
        if (!inv.gold || state.gold > inv.gold) state.gold = inv.gold || 0
        else if (state.gold < 0) state.gold = 0
      }
    }
  }

  /**
   * Set the handler for ending the trade, or end the trade if a handler is already set.
   * @param {() => void} fn Function to run when the trade ends.
   */
  end(fn) {
    if (typeof fn === "function") this._end = fn
    else {
      this._end?.()
      // todo take and add items
    }
  }

  /**
   * Check if the trade can end, if so, end it.
   */
  checkEnd() {
    this.check()
    if (this.accepted) this.end()
  }
}

class TradeState {
  constructor(trade) {
    /** @type {Trade} */
    this.trade = trade
    this.accepted = false
    // /** @type {{ name: string, id: string, key: keyof Trade["client"]["config"]["items"], type: "sword" | "axe" | "bow" | "spell" | "armour", amount: string }[]} */
    // this.items = []
    this.gold = 0
    /** @type {{[x: string]: number}} */
    this.gems = {}
    this.prompting = false
  }

  /**
   * Accept the trade offer.
   */
  accept() {
    this.accepted = true
    this.trade.checkEnd()
  }

  /**
   * Add to the amount of an item that is being traded.
   * @param {"Gold"} name The name of the gem, or Gold if it's gold.
   * @param {number} amount The amount to add, can be negative.
   */
  addAmount(name, amount) {
    if (name === "Gold") this.gold += amount
    else {
      const gem = this.trade.client.util.resolveGem(name)
      if (gem) {
        this.gems[gem.code] = (this.gems[gem.code] || 0) + amount
        if (this.gems[gem.code] <= 0) delete this.gems[gem.code]
      } else return this
    }
    this.trade.modified()
    return this
  }

  /**
   * Remove a gem from the trade.
   * @param {string} name The name of the gem to remove.
   */
  removeGem(name) {
    // if (name === "Gold") this.gold
    return delete this.gems[this.trade.client.util.resolveGem(name)?.code]
  }

  /**
   * Get the amount of an item.
   * @param {string} name The name of the gem, or Gold.
   */
  getAmount(name) {
    if (name === "Gold") return this.gold
    return this.gems[this.trade.client.util.resolveGem(name)?.code]
  }

  /**
   * Reset all items to 0.
   */
  empty() {
    this.gold = 0
    this.gems = {}
    this.trade.modified()
  }

  toString() {
    return `${this.prompting ? ".".repeat(Math.floor(Math.random() * 3) + 2) : this.accepted ? "✅" : ""}
    
    Gold: ${this.gold.toLocaleString()}

    ${Object.keys(this.gems)
      .sort((a, b) => this.gems[b] - this.gems[a])
      .map(k => `${this.trade.client.util.resolveGem(k).name}: ${this.gems[k].toLocaleString()}`)}`.trim().stripIndents()
  }
}

module.exports = Trade
module.exports.TradeState = TradeState