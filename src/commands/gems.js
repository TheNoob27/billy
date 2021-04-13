const { Command, Embed } = require("../classes")

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "gems",
      aliases: ["g"],
      description: "View a list of all your gems.",
      usage: "b!gems",
      category: "FOB",
      botPerms: ["EMBED_LINKS"]
    })
  }
  
  async run(message, args) {
    const inv = this.client.db.get(`${message.author.id}.inventory.gems`)
    const list = this.client.config.gems

    const gems = []
    if (inv)
      for (const g of list) {
        const gem = this.client.util.resolveGem(g)
        if (inv[gem.code]) gems.push(`**${gem.name}**: ${inv[gem.code].toLocaleString()}`)
        if (g === "Dragon Bone" || g === "Benitoite") gems.push("")
      }

    return this.sendToAuthor(
      message,
      new Embed()
        .setTitle("Gems")
        .setDescription(gems.join("\n"))
        .setFooter(`Total Gems: ${Object.values(inv || {}).reduce((p, a) => p + a, 0)}`)
        .setColor(this.client.colors.color)
    )
  }
}
