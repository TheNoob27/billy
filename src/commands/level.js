const { Command, Embed } = require("../classes")

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "level",
      aliases: ["l", "lvl"],
      description: "See your level and XP.",
      usage: "b!level",
      category: "FOB",
    })
  }
  
  async run(message, args) {
    const level = this.client.db.get(`${message.author.id}.level`) || { level: 1, xp: 0 }
    const { level: current } = level
    const [pastXP, required] = this.client.config.xpNeeded.slice(current - 1, current + 1)
    return this.sendToAuthor(
      message,
      new Embed()
        .setTitle("Level Stats")
        .setColor(this.client.colors.color)
        .addField("Level", current)
        .addField("Total XP", level.xp.toLocaleString())
        .addField("Progress", `${level.xp - pastXP}/${required - pastXP}`)
    )
  }
}
