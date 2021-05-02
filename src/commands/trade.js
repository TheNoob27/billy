const { Command, Embed } = require("../classes")
const Trade = require("../classes/Trade")

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "trade",
      aliases: ["t", "swap"],
      description: "Trade gems and gold with another user.",
      usage: "b!trade <user>",
      category: "FOB",
      cooldown: 5000,
      botPerms: [],
    })

    this.trading = []
  }

  /** @param {import("discord.js").Message} message */
  async run(message) {
    if (this.trading.includes(message.author.id)) return message.channel.send(`You are already trading with someone!`)

    let requested = message.mentions.users.first()
    if (requested?.id === message.author.id || requested?.bot) requested = undefined
    this.trading.push(message.author.id)
    const acceptMessage = await message.channel.send(requested?.toString(), {
      allowedMentions: { parse: [] },
      embed: new Embed()
        .setColor(this.client.colors.color)
        .setDescription(`**${message.author.username}** wants to trade with ${requested ? "you" : "someone"}! React to accept and start trading with them.`)
        .setTimestamp()
    })

    const e = ["✅", "🛑"]
    await acceptMessage.react(e)

    const collector = acceptMessage.createReactionCollector(
      (r, user) =>
        e.includes(r.emoji.name) &&
        (requested // pinged someone
          ? // its the pinged person or the author saying stop
            user.id === requested.id || (r.emoji.name === e[1] && user.id === message.author.id)
          : // its not the author or its the author saying stop
            user.id !== message.author.id || r.emoji.name === e[1]),
      { time: 60000, max: 1 }
    )

    let stopped = false
    let accepted = null
    collector.on("collect", (r, user) => {
      if (r.emoji.name === "✅") accepted = user
      else if (message.author.id === user.id) stopped = true
    })
    collector.on("end", (_, r) => {
      if (r.includes("Delete") || r === "time") {
        this.trading.remove(message.author.id)
        if (r === "time") return message.channel.send(`No-one accepted in 60 seconds, so the trade was cancelled.`)
        else return
      }
      if (!accepted) {
        this.trading.remove(message.author.id)
        return message.channel.send(stopped ? "The trade has been cancelled." : `Sorry, but they said no.`)
      }
      this.trading.push(accepted.id)
      this.trade(message, accepted)
    })
  }

  /** @param {import("discord.js").Message} message @param {import("discord.js").User} user */
  async trade(message, user) {
    const trade = new Trade(this.client, message.author, user)
    const emojis = [
      "➕", // add 500 gold
      "➖", // remove 500 gold
      "💎", // specify a gem to add
      "🪙", // set the amount of gold
      "🗑️", // reset your items
      "✅", // accept the trade offer
      "❌", // decline the trade offer
    ]
    const m = await message.channel.send(
      new Embed()
        .setTitle("Trade")
        .setDescription(`**${message.author.tag}** is trading with **${user.tag}**...`)
        .setColor(this.client.colors.color)
    )

    await m.react(emojis)
    await m.edit(
      new Embed()
        .setTitle("Trade")
        .setDescription(`**${message.author.tag}** is trading with **${user.tag}**...

        React with ${emojis[0]} to add 500 gold and ${emojis[1]} to remove 500 gold.
        React with ${emojis[2]} to specify a gem to add (e.g. 4 Copal) and ${emojis[3]} to set the amount of gold (e.g. 50,000).
        If you want to reset your trade items, react with ${emojis[4]}
        When you're ready, react with ${emojis[5]} to accept the trade offer, or ${emojis[6]} to decline.`.stripIndents())
        .setColor(this.client.colors.color)
    )

    const tEdit = setInterval(() => {
      const embed = new Embed()
        .setTitle("Trade")
        .setDescription(`**${message.author.tag}** is trading with **${user.tag}**...

        React with ${emojis[0]} to add 500 gold and ${emojis[1]} to remove 500 gold.
        React with ${emojis[2]} to specify a gem to add (e.g. 4 Copal) and ${emojis[3]} to set the amount of gold (e.g. 50,000).
        If you want to reset your trade items, react with ${emojis[4]}
        When you're ready, react with ${emojis[5]} to accept the trade offer, or ${emojis[6]} to decline.`.stripIndents())
        .setColor(this.client.colors.color)
        .addField(`${message.author.username}'s items`, trade.state.trader)
        .addField(`${user.username}'s items`, trade.state.tradingWith)
      if (JSON.stringify(embed) === JSON.stringify(m.embed)) return Promise.resolve()
      return m.edit(embed)
    }, 2100)

    let prompting = []
    const collector = m.createReactionCollector(
      (r, user) => emojis.includes(r.emoji.name) && (user.id === trade.trader.id || user.id === trade.tradingWith.id),
      { idle: 120000, dispose: true }
    )
    trade.end(() => collector.stop("ended"))
    const prompt = async (p, authorID) => {
      prompting.push(authorID)
      trade.getState(authorID).prompting = true
      const msg = await message.channel.send(p)
      const res = await message.channel.awaitMessages(msg => msg.author.id === authorID, { max: 1 })
      prompting.remove(authorID)
      trade.getState(authorID).prompting = false
      if (!msg.deleted) await msg.delete().silence()
      return res.first().content.replace(/[,.]/g, "")
    }
    collector.on("collect", async (r, user) => {
      if (prompting.includes(user.id)) return
      const state = trade.getState(user)
      switch (r.emoji.name) {
        case emojis[0]: // +
          return state.addAmount("Gold", 500)
        case emojis[1]: // -
          return state.addAmount("Gold", -500)
        case emojis[2]: // gem
          const str = await prompt(`${user}, please say what gem you'd like to add. (e.g. 12 Copal, -2 Diamond)`, user.id)
          const [, i = 1, name] = str.match(/(?:(-?\d+) +)?([\w ]+)/) || []
          console.log(i, name)
          if (name === "Gold" || !name) return
          return state.addAmount(name, +i)
        case emojis[3]: // set gold
          const n = await prompt(`${user}, please say the number of gold to set it to.`, user.id)
          if (isNaN(n)) return
          return state.gold = Math.max(0, n)
        case emojis[4]: // reset
          return state.empty()
        case emojis[5]: // √ accept
          return state.accept()
        case emojis[6]: // X decline
          collector.stop("Delete")
          return message.channel.send(`${user.id !== message.author.id ? message.author : trade.tradingWith}, ${user} declined the trade.`)
      }
    })
    collector.on("remove", async (r, user) => {
      if (prompting.includes(user.id)) return
      const state = trade.getState(user)
      switch (r.emoji.name) {
        case emojis[5]: // √ unaccept
          return state.accepted = false
        default:
          collector.emit("collect", r, user)
      }
    })
    collector.on("end", (_, reason) => {
      tEdit._onTimeout()
      clearInterval(tEdit)
      this.trading.remove(message.author.id, user.id)
      if (reason === "idle") return message.channel.send(`${message.author}, ${user}, the trade was cancelled due to inactivity.`)
      if (reason.includes("Delete")) return
      if (reason === "ended") {
        // subtract and add stuff and stuff
        const add = (o, n, a) => console.log("adding", a, "to", n + ":", n.includes(".") ? o[n.split(".")[0]][n.split(".")[1]] = (o[n.split(".")[0]][n.split(".")[1]] || 0) + a : o[n] = (o[n] || 0) + a) // i'm keeping this code cursed whether you like it or not
        for (const t of ["trader", "tradingWith"]) {
          /** @type {Trade.TradeState} */
          const state = trade.state[t]
          /** @type {import("discord.js").User} */
          const u = trade[t]
          const o = t === "trader" ? trade.tradingWith : trade.trader
          const inv = this.client.db.get(`${u.id}.inventory`)
          const inv2 = this.client.db.get(`${o.id}.inventory`)
          if (state.gold) {
            add(inv, "gold", -state.gold)
            add(inv2, "gold", state.gold)
          }
          for (const g in state.gems) {
            add(inv, `gems.${g}`, -state.gems[g])
            add(inv2, `gems.${g}`, state.gems[g])
          }
        }
        return message.channel.send(`${message.author} ${user}, the trade was successful.`)
      }
    })
  }
}
