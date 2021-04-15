const { Command, Embed } = require("../classes")

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "sell",
      aliases: ["sl"],
      description: "Sell an item or gem.",
      usage: "b!sell (number) <item> ...",
      category: "FOB",
    })
  }
  
  async run(message, args) {
    const str = args.join(" ").replace(/[.']/g, "")
    const re = / *(?:(\d+) )?([\w ]+),?/g
    let match
    const type = name =>
      Object.keys(this.client.config.items)
        .find(t => this.client.config.items[t].includes(name))
        ?.replace(/s$/, "")

    const inv = this.client.db.get(`${message.author.id}.inventory`) || {}
    const has = item =>
      Array.isArray(inv[type(item.name)])
        ? inv[type(item.name)].includes(item.name)
        : inv[type(item.name)] === item.name

    let sold = false
    const old = inv.gold || 0
    while (match = re.exec(str)) {
      let [, n = 1, name] = match
      n = Math.max(1, n)
      if (this.client.util.resolveGem(name)) {
        const gem = this.client.util.resolveGem(name)
        if ((inv.gems?.[gem.code] || 0) < n) continue
        inv.gems[gem.code] -= n
        inv.gold += gem.sell
        sold = true
        continue
      } else {
        const item = this.client.util.resolveItem(name)
        if (!item || !has(item)) continue
        const t = type(item.name)
        switch (t) {
          case "axe":
          case "spell":
            inv[t + "s"].remove(item.name)
            break
          default:
            delete inv[t]
        }
        inv.gold += item.cost * 0.3
        sold = true
      }
    }
    return message.channel.send(sold ? `Successfully sold those items for ${(inv.gold - old).toLocaleString()} gold!` : "I could not find the items you wanted to sell.")
  }
}
