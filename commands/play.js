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
    if (client.game) {
      return message.channel.send("A game is already running! Wait for that game to end before starting a new one! \n" + (client.game.collector ? client.game.collector.message.url : client.game.channel.toString()))
    }
    
    let game = new Game(message.channel)
    client.game = game
    
    
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
      
      collector.on("collect", r => {
        let user = r.users.last()
        
        if (r.emoji == options[0]) {
          if (game.players.has(user.id)) return;
          game.addPlayer(user)
        } else if (r.emoji == options[1]) {
          if (!game.players.has(user.id)) return;
          game.removePlayer(user)
        } else if (r.emoji == options[2]) {
          if (user.id !== message.author.id || game.players.size <= 0) return;
          return collector.stop("start")
        } else {
          if (user.id !== message.author.id) return;
          client.game = null
          return collector.stop("cancel")
        }
        
        msg.edit(
          new RichEmbed()
          .setColor(colors.color)
          .setDescription("A new game is starting! React with ⚔️ to join and react with ➖ to leave! \n"+message.author.username+", React with ✅ to start, but the game will start automatically in 5 minutes, or react with 🛑 to cancel and not start the game.")
          .addField("Players", "**​"+ game.players.map(p => p.tag).join("\n") +"**")
        )
      })
      
      collector.on("end", (_, reason) => {
        if (reason == "cancel") {
          client.game = null
          return message.channel.send("The game has been cancelled.")
        }
        game.init()
        
        setTimeout(() => play(), 5000)
      })
    })
    
    function play(general = false) {
      let enemy = game.spawnEnemy(general ? {
      name: "General",
      hp: 1162,
      damage: 45
    } : undefined)
      
      let hp = enemy.hp
      
      let embed = new RichEmbed()
      .setTitle("Field of Battle")
      .addField("Enemy #" + game.enemycount, "You and your team have encountered " + (general ? "the **" + enemy.name + "**" : "a "+ enemy.name) + "! Press the sword reaction to hit him. You have " + (general ? "5" : "3") +" minutes.")
      .addField("Enemy's HP", enemy.hp + "/" + hp)
      .addField("Your Team", "​"+ game.players.map(player => "**"+player.tag+"** - HP: "+ player.hp).join("\n"))
      .setColor(colors.color)
    
      message.channel.send(embed).then(async msg => {
        await msg.react("⚔️")
      
        let filter = (r, user) => ["⚔️"].includes(r.emoji.name) && game.players.has(user.id)
        let collector = game.collector = msg.createReactionCollector(filter, {time: general ? 300000 : 180000}) // 3mins 
        let helped = []
    
        let updatedmg = setInterval(() => {
          msg.edit(
            new RichEmbed()
            .setTitle("Field of Battle")
            .addField("Enemy #" + game.enemycount, "You and your team have encountered " + (general ? "the **" + enemy.name + "**" : "a "+ enemy.name) + "! Press the sword reaction to hit him. You have " + (general ? "5" : "3") +" minutes.")
            .addField("Enemy's HP", enemy.hp + "/" + hp)
            .addField("Your Team", "​"+ game.players.map(player => "**"+player.tag+"** - HP: "+ (player.hp < 0 ? 0 : player.hp)).join("\n"))
            .setColor(colors.color)
          )
        }, 2100)
    
        collector.on("collect", r => {
          let user = r.users.last()
          
          let player = game.players.get(user.id)
          
          if (r.emoji == "⚔️") {
            game.attackEnemy(player)
            if (!helped.includes(player.id)) helped.push(player.id)
            if (collector.ended) return game.endCollector(msg, hp, updatedmg) // enemydied
            
            if (Math.random() > 0.5) {
              game.attackPlayer(player)
              if (enemy.hp <= 0 || game.players.size <= 0) return game.endCollector(msg, hp, updatedmg) // all players or enemy died
            }
          }
        })
        
        collector.on("end", (_, reason) => {
          if (reason == "time") {
            clearInterval(game.regen)
            client.game = null
            
            return message.channel.send("You automatically lose, because you took too long.")
          } else if (reason == "alldied" || game.players.size <= 0) {
            return end(true)
          }
          
          message.channel.send("Yay, the "+enemy.name+" died!")
          
          game.reward(helped, hp)
          
          return general ? end() : setTimeout(() => play(game.shouldSpawnGeneral), 5000)
        })
      })
    }
    
    function end(alldied = false) {
      clearInterval(game.regen)
      let enemyteam = game.team == "Humans" ? "Orcs" : "Humans"
    
      if (alldied) { 
        let embed = new RichEmbed()
        .setTitle(enemyteam + " Win.")
        .setDescription("Your team wasn't able to successfully kill all of the "+enemyteam+", so you lose.")
        .setColor(colors.error)
        .setTimestamp()
        .setFooter("Better luck next time.")
      
        message.channel.send(embed)
        
        if (game.shouldSpawnDemon) {
          game.players = game.playerCache
          setTimeout(() => {
            client.commands.get("demon").run(client, message, args, colors, "", game)
          }, Math.random() * 4000 + 5000)
        } else return client.game = null
      } else {
        let embed = new RichEmbed()
        .setTitle(game.team + " Win!")
        .setDescription("Your team successfully killed all of the "+enemyteam+", so you win. :tada:")
        .setColor(game.team == "Humans" ? "#1f5699" : "#3d8a29")
        .setTimestamp()
        .setFooter("Congratulations. Survivors: "+game.players.size)
      
        message.channel.send(embed)
      
        if (game.shouldSpawnDemon) {
          game.players = game.playerCache
          setTimeout(() => {
            client.commands.get("demon").run(client, message, args, colors, "", game)
          }, Math.random() * 4000 + 5000)
        } else return client.game = null
      }
    }
  }
}

module.exports = Play