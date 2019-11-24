const db = require('quick.db')
const Discord = require('discord.js')

module.exports.run = async (client, message, args, colors) => {

  setup()
  
function setup() {
  
  let game = {
    players: [],
    rounds: null
  }
  
  let embed = new Discord.RichEmbed()
  .setColor(colors.color)
  .setDescription("A new game is starting! React with ⚔️ to join! \n"+message.author.username+", React with ✅ to start, but the game will start automatically in 5 minutes.")
  .addField("Players", "​")
  message.channel.send(embed).then(async msg => {
    await msg.react("⚔️")
    await msg.react("✅")
    
    let filter = (r, user) => ["⚔️", "✅"].includes(r.emoji.name) && !user.bot
    let collector = msg.createReactionCollector(filter, {time: 300000})
    let players = []
    
    collector.on("collect", r => {
      let user = r.users.last()
      
      if (r.emoji == "⚔️") {
        let find = game.players.find(player => player.id == user.id)
        if (find) return;
        
        game.players.push({
          id: user.id,
          level: 1,
          hp: 100,
          tag: user.tag
        })
        
          players.push(user.tag)
        
        msg.edit(embed = new Discord.RichEmbed()
                 .setColor(colors.color)
                 .setDescription("A new game is starting! React with ⚔️ to join! \n React with ✅ to start, but the game will start automatically in 5 minutes.")
                 .addField("Players", "**"+ players.join("\n") +"**")
                             )
      } else {
        if (user.id != message.author.id) return
        collector.stop()
      }
      
    })
    
    collector.on("end", () => {
      let rounds = Math.ceil(Math.random() * 5) + 10
      game.rounds = rounds
      message.channel.send("Game starting (well it isnt, but it wouldve been starting now lol). There will be ")
    })
  })

  }

}
module.exports.help = {
  name: "play",
  aliases: ["battle"],
  description: "Play a game that is supposed to mimic FOB",
  usage: `b!play`,
  category: "Soon"
}