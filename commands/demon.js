const Discord = require('discord.js')
const { getgem } = require("../fobfunctions.js")
module.exports.run = async (client, message, args, colors, prefix, game) => {
if (!game && message.author.id != client.owner) return;
  
  function setup() {
    
  }
  
  function fight() {
    let enemy = {
      name: "Demon",
      hp: 1882,
      damage: 66
    }
    let hp = enemy.hp
    let target = {
      player: game.players[Math.floor(Math.random() * game.players.length)]
    }
    
    let embed = new Discord.RichEmbed()
    .setTitle("Field of Battle")
    .setDescription("**A GIANT DEMON SPAWN APPEARED!!**\n\nReact to hit it! You have 8 minutes")
    .addField("Demon's HP", enemy.hp + "/" + hp)
    .addField("Your Team", "​"+ game.players.map(player => "**"+player.tag+"** - HP: "+ player.hp).join("\n"))
    .setColor(colors.color)
    
    message.channel.send(embed).then(async msg => {
      await msg.react("⚔️")
      
    let filter = (r, user) => ["⚔️"].includes(r.emoji.name) && game.playerlist.includes(user.id)
    let collector = msg.createReactionCollector(filter, {time: 480000})
    let enemydied = false
    
    
    let updatedmg = setInterval(() => {
      //console.log(enemy.name + ": "+ enemy.hp)
      msg.edit(new Discord.RichEmbed()
    .setTitle("Field of Battle")
    .setDescription("**A GIANT DEMON SPAWN APPEARED!!**\n\nReact to hit it! You have 8 minutes")
    .addField("Demon's HP", enemy.hp + "/" + hp)
    .addField("Your Team", "​"+ game.players.map(player => "**"+player.tag+"** - HP: "+ player.hp).join("\n"))
    .setColor(colors.color)
    )
    }, 1500)
    
    
    
    collector.on("collect", r => {
      let user = r.users.last()
      let player = game.players.find(p => p.id == user.id)
      if (Math.random() > 0.3) enemy.hp -= player.damage
      
      if (enemy.hp <= 0) {
        clearInterval(updatedmg)
        msg.edit(new Discord.RichEmbed()
    .setTitle("Field of Battle")
    .setDescription("**A GIANT DEMON SPAWN APPEARED!!**\n\nReact to hit it! You have 8 minutes")
    .addField("Demon's HP", enemy.hp + "/" + hp)
    .addField("Your Team", "​"+ game.players.map(player => "**"+player.tag+"** - HP: "+ player.hp).join("\n"))
    .setColor(colors.color)
    )
        enemydied = true
        return collector.stop()
      }
      
      if (Math.random() > 0.7) {
        target.player.hp -= enemy.damage
      if (target.player.hp <= 0) {
        message.channel.send("**"+player.tag+"** died! They respawn in 7 seconds..")
        for (var i = 0; i < game.playerlist.length; i++) {
          if (game.playerlist[i] == target.player.id) {
            game.playerlist.splice(i, 1)
            setTimeout(() => game.playerlist.push(target.player.id), 7000)
            
            target = {
              player: game.players[Math.floor(Math.random() * game.players.length)]
            }
            
            break;
          }
        }
        
      }
      }
      
      if (Math.random() > 0.85) {
        message.channel.send("**"+player.tag+"** got flung!")
        for (var i = 0; i < game.playerlist.length; i++) {
          if (game.playerlist[i] == target.player.id) {
            game.playerlist.splice(i, 1)
          }
        }
        
        if (target.player == player) {
          target = {
            player: game.players[Math.floor(Math.random() * game.players.length)]
          };
        }
        
        setTimeout(() => {
          message.channel.send("**"+player.tag+"** died! They respawn in 7 seconds..")
        
            setTimeout(() => game.playerlist.push(target.player.id), 7000)
            
        }, (Math.random() * 8999) + 1000)
      }
    })
      
      collector.on("end", () => {
        if (!enemydied) return message.channel.send("You automatically lose, because you took too long.")
        if (enemydied) message.channel.send("The Demon has been defeated!!! \n\nWait, it's raining... gems.")
       
        gemrain()
      })
    })
  }
  
  function gemrain(game) {
    let legendary = null
    let gems = []
    for (var i = 0; i < 25; i++) {
      let gem 
      if (legendary) gem = getgem()
      else gem = getgem(true)
      
      if (gem.islegendary) legendary = gem.name
      
      gems.push(gem)
    }
    
    if (!legendary) gems[Math.floor(Math.random() * gems.length)] = getgem(true, true)
    
    
  }
  
  function collectgem(game, gems, legend) {
      let user = client.users.get(game.playerlist[Math.floor(Math.random() * game.playerlist.length)])
      
      let jokes = ["Is it a Mithril, or a Copal 🤔", 
                   "It's probably just a Spinel 😔",
                   "I think thats a Fury Stone 👀", 
                   "This better be a good gem 😩",
                  "NO! They're gonna get it before me 😡",
                  "I better get this 🤞",
                  "I think I should just leave it "]
      let embed = new Discord.RichEmbed()
      .setTitle("Gem Rain")
      .setDescription("You have spotted a gem! Do you want to collect it?")
      .setColor("RANDOM")
      
    }
}
module.exports.help = {
  name: "demon",
  aliases: [],
  description: "Summons the demon, can only be summoned after the play command.",
  usage: `b!demon`,
  category: "Secret"
}