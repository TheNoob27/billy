const { Command, Embed } = require("../classes")

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "mine",
      aliases: ["m"],
      description: "Mine gems while in a game.",
      usage: "b!mine",
      category: "FOB",
      cooldown: 60000,
    })
  }
  
  async run(message, args) {
    const d = () => this.deleteCooldown(message.author.id)
    if (!this.client.game?.players.has(message.author.id)) return d(), message.channel.send("You need to be in a game to mine gems.")
    if (!this.client.game._regen) return d(), message.channel.send("The game you're in hasn't started yet so you're still in the lobby!")
    if (this.client.game.enemy?.general) return d(), message.channel.send("You cannot mine right now! You're too busy fighting the general.")

    const gem = this.client.util.generateGem(false)
    return this.sendToAuthor(
      message,
      `You mined a ${gem.name} 3 times! You now have ${this.client.db.add(
        `${message.author.id}.inventory.gems.${gem.code}`,
        3
      )}.`
    )
    // nvm lol this is annoying
    // for (const i of 3) { // true fob experience
    //   await message.channel.send(`You mined a ${gem.name}! You now have ${this.client.db.add(`${message.author.id}.inventory.gems.${gem.code}`, 1)}.`)
    //   await waitTimeout(2000)
    // }
  }
}
