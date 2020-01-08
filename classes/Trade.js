class Trade {
  constructor(client, user, user2) {
    this.client = client
    this.trader = user
    this.tradingWith = user2
    this.items1 = []
    this.items2 = []
  }
  
  addItem(item = {}, slot = 1) {
    if (item.name) return false;
    
    if (item.name !== "Gold") {
      
    } else {
      
    }
  }
}