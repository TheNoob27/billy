class Trade {
  constructor(user, user2) {
    this.client = user.client
    this.trader = user
    this.tradingWith = user2
    this.accepted = {
      "1": false,
      "2": false
    }
    this.items = {
      "1": [],
      "2": []
    }
    return this
  }
  
  modify(slot) {
    if (this.accepted[slot]) this.accepted[slot] = false
  }
  
  clear(slot) {
    this.modify(slot)
    
    this.items[slot] = []
  }
  
  getItem(slot = 1, name) {
    return this.items[slot]
  }
  
  addGold(slot = 1, amount = 500) {
    this.modify(slot)
    
    let exists = this.items[slot].some(i => i.name == "Gold")
    if (exists) this.items[slot].find(i => i.name == "Gold").amount += amount
    else this.items[slot].push({name: "Gold", amount: amount})
  }
  
  removeGold(slot = 1, amount = 500) {
    this.modify(slot)
    
    let exists = this.items[slot].some(i => i.name == "Gold")
    if (exists) this.items[slot].find(i => i.name == "Gold").amount -= amount
  }
  
  addItem(slot = 1, item = {}) {
    if (!item.name || !this.items[slot]) return false;

    this.modify(slot)
    
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