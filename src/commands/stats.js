const { Command, Embed } = require("../classes")

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "stats",
      aliases: ["st"],
      description: "View stats about the games you've played.",
      usage: "b!stats",
      category: "FOB",
      botPerms: ["EMBED_LINKS"]
    })
  }
  
  async run(message, args) {
    const stats = this.client.db.get(`${message.author.id}.stats`) || {}
    const stat = name => (stats[name] || 0).toLocaleString()
    return message.channel.send(
      new Embed()
        .setTitle("Stats")
        .setColor(this.client.colors.color)
        .setDescription(`
        **Games Played**: ${stat("games")}
        **Wins**: ${stat("wins")}

        **Hits**: ${stat("hits")}
        **Kills**: ${stat("kills")}
        **Damage Dealt**: ${stat("damage")}
        **Spells Used**: ${stat("spellsUsed")}
        **Enemies Fought**: ${stat("helpedKill")}
        `.stripIndents())
    )
  }
}
