class Trade {
  constructor(client, trade1, trade2) {
    trade2.trade = this
    trade2.tradingWith = trade1
    
    this.client = client
    this.trade1 = trade1
    this.trade2 = trade2
    this.items = []
    this.checks = 0
    
  }
  
  send(...msg) {
    if (this.trade1.channel.id == this.trade2.channel.id) {
      this.trade1.channel.send(...msg)
    } else {
      
    }
  }
  
  check(user) {
    this.checks += 1
  }
  
}
