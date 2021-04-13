const { Command, Embed } = require("../classes")

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "buy",
      aliases: ["b", "purchase", "get"],
      description: "Buy a weapon/item from the shop.",
      usage: "b!buy <item>",
      category: "FOB",
      botPerms: ["EMBED_LINKS"]
    })
  }
  
  async run(message, args) {
    if (!args[0]) return
    const inv = this.client.db.get(`${message.author.id}.inventory`) || {}
    const type = (name) =>
      Object.keys(this.client.config.items)
        .find(t => this.client.config.items[t].includes(name))
        ?.replace(/s$/, "")
    const canBuy = item =>
      inv.gold > item.cost && // has enough gold
      item.gemsNeeded.every(g => inv.gems?.[g] > 0) && // has required gems
      (Array.isArray(inv[type(item.name)]) // doesn't have item
        ? !inv[type(item.name)].includes(item.name)
        : inv[type(item.name)] !== item.name) &&
      (type(item.name) !== "axe" || inv.axes?.length === 2 === false) // isn't at max axes
    const reason = item =>
      inv.gold < item.cost ? `You do not have enough gold to purchase this item. You need ${(item.cost - inv.gold).toLocaleString()} more gold to purchase this item.` :
      !item.gemsNeeded.every(g => inv.gems?.[g] > 0) ? `You do not have the gems required to purchase this item. You need a **${item.gemsNeeded.filter(g => !inv.gems?.[g]).map(g => this.client.util.resolveGem(g).name).join("**, **")}**.` :
      type(item.name) === "axe" && inv.axes?.length === 2 ? "You cannot have more than two axes at once." :
      "You already own this item."
    // i'll let people have multiple spells for now

    const item = this.client.util.resolveItem(args.join(" "))
    if (!item) return message.channel.send("Sorry, I couldn't find the item you were looking for.")
    if (canBuy(item)) {
      this.client.db.subtract(`${message.author.id}.inventory.gold`, item.cost)
      switch (type(item.name)) {
        case "sword":
        case "bow":
        case "armour":
          this.client.db.set(`${message.author.id}.inventory.${type(item.name)}`, item.name)
          break
        case "spell":
        case "axe":
          this.client.db.push(`${message.author.id}.inventory.${type(item.name)}s`, item.name)
          break
      }
      return message.channel.send(
        new Embed()
          .setTitle("Purchase Successful")
          .setDescription(`Successfully bought **${item.name}** for ${item.cost.toLocaleString()} gold!`)
          .setColor(this.client.colors.color)
      )
    } else {
      return message.channel.send(
        new Embed()
          .setTitle("Purchase Failed")
          .setDescription(`The purchase of **${item.name}** was not successful.`)
          .addField("Reason", reason(item))
          .setColor(this.client.colors.error)
      )
    }
  }
}
