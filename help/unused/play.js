const { getgem, addxp } = require("../fobfunctions.js")
const { RichEmbed } = require("discord.js")
const Command = require("../classes/Command.js")
const Game = require("../classes/Game.js")

class Play extends Command {
  constructor(client) {
    super(client, {
      name: "play",
      aliases: ["battle"],
      description: "Play a game with friends or by yourself that is supposed to mimic FOB.",
      usage: `b!play`,
      category: "FOB",
      cooldown: 300000,
      cooldownmsg: "You can play another game in {time}."
    })
  }
  
  async run(client, message, args, colors) {
    let game = new Game(message.channel)
    
    let embed = new RichEmbed()
    .setColor(colors.color)
    .setDescription("A new game is starting! React with ⚔️ to join and react with ➖ to leave! \n"+message.author.username+", React with ✅ to start, but the game will start automatically in 5 minutes, or react with 🛑 to cancel and not start the game.")
    .addField("Players", "​")
    message.channel.send(embed).then(async msg => {

      let options = ["⚔️", "➖", "✅", "🛑"]
      
      for (let i in options) {
        await msg.react(options[i])
      }
      
      let stopped = false
      let filter = (r, user) => ["⚔️", "➖", "✅", "🛑"].includes(r.emoji.name) && !user.bot
      let collector = msg.createReactionCollector(filter, {time: 300000})
      
      collector.on("collect", (r, user) => {
        if (r.emoji == options[0]) {
          if (game.players.has(user.id)) return;
          game.addPlayer(user)
        } else if (r.emoji == options[1]) {
          if (!game.players.has(user.id)) return;
          game.removePlayer(user)
        } else if (r.emoji == options[2]) {
          if (user.id !== message.author.id || game.players.size >= 0) return;
          return collector.stop("start")
        } else {
          if (user.id !== message.author.id) return;
          return collector.stop("cancel")
        }
        
        msg.edit(
          new RichEmbed()
          .setColor(colors.color)
          .setDescription("A new game is starting! React with ⚔️ to join and react with ➖ to leave! \n"+message.author.username+", React with ✅ to start, but the game will start automatically in 5 minutes, or react with 🛑 to cancel and not start the game.")
          .addField("Players", "**​"+ game.players.map(p => p.tag).join("\n") +"**")
        )
      })
      
      collector.on("end", reason => {
        if (reason == "cancel") return message.channel.send("The game has been cancelled.")
        
        game.init()
        
        setTimeout(() => play(), 5000)
      })
    })
    
    function play() {
      let enemy = game.spawnEnemy()
      let hp = enemy.hp
      
      let embed = new RichEmbed()
      .setTitle("Field of Battle")
      .addField("Enemy #" + game.enemycount, "You and your team have encountered a "+ enemy.name + "! Press the sword reaction to hit him. You have 2 minutes.")
      .addField("Enemy's HP", enemy.hp + "/" + hp)
      .addField("Your Team", "​"+ game.players.map(player => "**"+player.tag+"** - HP: "+ player.hp).join("\n"))
      .setColor(colors.color)
    
      message.channel.send(embed).then(async msg => {
        await msg.react("⚔️")
      
        let filter = (r, user) => ["⚔️"].includes(r.emoji.name) && game.playerlist.includes(user.id)
        let collector = game.collector = msg.createReactionCollector(filter, {time: 120000})    
        let helped = []
    
        let updatedmg = setInterval(() => {
          msg.edit(
            new RichEmbed()
            .setTitle("Field of Battle")
            .addField("Enemy #" + game.enemycount, "You and your team have encountered a "+ enemy.name + "! Press the sword reaction to hit him. You have 2 minutes.")
            .addField("Enemy's HP", enemy.hp + "/" + hp)
            .addField("Your Team", "​"+ game.players.map(player => "**"+player.tag+"** - HP: "+ (player.hp < 0 ? 0 : player.hp)).join("\n"))
            .setColor(colors.color)
          )
        }, 2100)
    
        collector.on("collect", (r, user) => {
          let player = game.players.get(user.id)
          
          if (r.emoji == "⚔️") {
            game.attackEnemy(player)
            if (collector.ended) return game.endCollector(msg, hp, updatedmg) // enemydied
            
            if (Math.random() > 0.5) {
              game.attackPlayer(player)
              if (collector.ended) return game.endCollector(msg, hp, updatedmg) // all players or enemy died
            }
          }
        })
        
        collector.on("end", reason => {
          
        })
      })
    }
  }
}