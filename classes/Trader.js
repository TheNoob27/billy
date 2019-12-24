const Trade = require("./Trade.js")

class Trader {
  constructor(client, message, second) {
    this.client = client
    this.trader = message.author
    this.tradingWith = second || null
    this.channel = message.channel
    this.trade = null
    
    this.client.trades.set(this.trader.id, this)
    
    if (!this.tradingWith) this.setup()
    else this.trade = new Trade(this, second)
  }
  
  setup() {
    this.channel.send("")
  }
  
  addGem(input = "") {
    if (input.toLowerCase() == "gold") {
      return {
        gem: "Gold"
      }
    } else {
      return this.client.resolveGem(input)
    }
  }
  
}
