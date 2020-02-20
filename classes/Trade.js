class Trade {
  constructor(user, user2) {
    this.client = user.client
    this.trader = user
    this.tradingWith = user2
    this.items = {
      "1": [],
      "2": []
    }
    return this
  }
  
  addGold(slot, amount = 500) {
    let exists = this.items[slot].some(i => i.name == "Gold")
    if (exists) this.items[slot].find(i => i.name == "Gold").amount += amount
    else this.items[slot].push({name: "Gold", amount: amount})
  }
  
  addItem(item = {}, slot = 1) {
    if (!item.name || !this.items[slot]) return false;

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
module.exports = Trade