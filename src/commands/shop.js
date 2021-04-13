const { Command, Embed } = require("../classes")

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "shop",
      aliases: ["s", "market", "items"],
      description: "View the shop, where all items will be available. Buy an item with b!buy <item>",
      usage: "b!shop",
      category: "FOB",
      cooldown: 1000,
      botPerms: ["EMBED_LINKS"],
    })
  }
  
  async run(message, args) {
    const inv = this.client.db.get(`${message.author.id}.inventory`) || {}
    const type = name =>
      Object.keys(this.client.config.items)
        .find(t => this.client.config.items[t].includes(name))?.replace(/s$/, "")
    const canBuy = item =>
      inv.gold > item.cost && // has enough gold
      item.gemsNeeded.every(g => inv.gems?.[g] > 0) // has required gems
    const status = item => 
      (
        Array.isArray(inv[type(item.name)])
          ? inv[type(item.name)].includes(item.name)
          : inv[type(item.name)] === item.name
      )
        ? " ✅"
        : !canBuy(item)
          ? " 🔒"
          : ""
    const types =
      args.length && args.filter(a => a in this.client.config.items).length // pain
        ? args.filter(a => a in this.client.config.items)
        : Object.keys(this.client.config.items)
    return message.channel.send(
      new Embed()
        .setTitle("Shop")
        .setColor(this.client.colors.help)
        .addFields(
          types.map(t => ({
            name: t.toProperCase(),
            value: this.client.config.items[t].map(name => {
              const item = this.client.util.resolveItem(name)
              return `
              **__${name}__**${status(item)}${item.description ? `\nDescription: ${item.description}` : ""}
              Damage: ${item.value}
              Gold: ${item.cost.toLocaleString()}${
                item.gemsNeeded.length ? `\nGems Needed: ${item.gemsNeeded.map(g => g.toProperCase(true)).join(", ")}` : ""
              }${item.bonus ? `\nBonus: ${item.bonus}` : ""}
              `.stripIndents()
            }).join("\n\n") + (t === types[types.length - 1] ? "" : "\n\n\u200b")
          }))
        )
    )
  }
}
