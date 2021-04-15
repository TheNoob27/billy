const { Command, Embed } = require("../classes")

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "difficulty",
      aliases: ["d", "goto", "switch", "diff"],
      description: "Set the difficulty by going to Field of Battle Beginner, Pro or Elite.",
      usage: "b!goto <beginner/pro/elite>",
      category: "FOB",
      lowerCaseArgs: [0]
    })
  }
  
  async run(message, args) {
    const d = [null, "Beginner", "Pro", "Elite"]
    const diff = this.client.db.get(`${message.author.id}.difficulty`) || 1
    if (!args[0])
      return message.channel.send(
        `You're currently in Field of Battle ${d[diff]}. Increasing the difficulty to Pro or Elite will result in more gold and XP, but harder enemies.`
      )
    const set = isNaN(args[0]) ? d.indexOf(args[0].toProperCase()) : Math.min(Math.max(args[0], 1), 3)
    if (set === -1) return message.channel.send(`That was not a valid difficulty.`)
    this.client.db.set(`${message.author.id}.difficulty`, set)
    return message.channel.send(
      `Your difficulty has been set to ${d[set]}. All matches hosted by you will be in Field of Battle ${d[set]}.`
    )
  }
}