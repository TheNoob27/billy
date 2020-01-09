class Trade {
  constructor(client, user, user2) {
    this.client = client
    this.trader = user
    this.tradingWith = user2
    this.items = {
      "1": [],
      "2": []
    }
  }
  
  addItem(item = {}, slot = 1) {
    if (!item.name) return false;
    if (typeof slot == "number") slot = String(slot)

    if (item.name !== "Gold") {
      let exists = this.items[slot].some(i => i.name == item.name)
      if (exists) this.items[slot].find(i => i.name == item.name).amount += item.amount
      else this.items[slot].push(item)
    } else {
      let exists = this.items[slot].some(i => i.name == "Gold")
      if (exists) this.items[slot].find(i => i.name == "Gold").amount += item.amount
      else this.items[slot].push(item)
    }
    return true
  }
  
  removeItem(item = {}, slot = 1) {
    if (!item.name) return false;
    let exists = this.items[slot].some(i => i.name == item.name)
    if (!exists) return false;
    item.amount = -item.amount
    return this.addItem(item, slot)
  }
}