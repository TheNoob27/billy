const { Command, Embed } = require("../classes")

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "inventory",
      aliases: ["i", "inv"],
      description: "Show all the items in your inventory.",
      usage: "b!inventory",
      category: "FOB",
      botPerms: ["EMBED_LINKS"]
    })
  }
  
  async run(message, args) {
    const inv = this.client.db.get(`${message.author.id}.inventory`) || {}
    return this.sendToAuthor(
      message,
      new Embed()
        .setTitle("Inventory")
        .setColor(this.client.colors.color)
        .addField("Sword", inv.sword || "Rusty Iron Sword", true)
        .addField("Axes", inv.axes?.join(", ") || "None", true)
        .addField("Bow", inv.bow || "Short Bow", true)
        .addField("Armour", inv.armour || "None", true)
        .addField(
          "Spells",
          inv.spells
            ?.map(s => `${this.client.config.emojis[s.replace(/^\w/, w => w.toLowerCase()).replace(" ", "")]} ${s}`)
            .join("\n") || "None",
          true
        )
        .addField("Gold", (inv.gold || 0).toLocaleString(), true)
        .addField("Gems", "Check your gems with b!gems.")
        .addField("Level", "Check your level with b!level.")
      )
  }
}