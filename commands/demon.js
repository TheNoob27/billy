const { getgem } = require("../fobfunctions.js")
const { RichEmbed } = require("discord.js")
const Command = require("../classes/Command.js")
const Game = require("../classes/Game.js")

class Demon extends Command {
  constructor(client) {
    super(client, {
      name: "demon",
      aliases: [],
      description: "Summons the demon, can only be summoned after the play command.",
      usage: `b!demon`,
      category: "Secret"
    })
  }
  
  async run(client, message, args, colors, prefix, game) {
    if (!game && message.author.id != client.owner) return;
    colors["demon"] = "#632f2f"
  
  if (!game) setup()
  else fight()
  
  function setup() {
     game = new Game(message.channel)
    
    let embed = new RichEmbed()
    .setColor(colors.demon)
    .setDescription("The Demon is being summoned! React with ⚔️ to join! \n"+message.author.username+", React with ✅ to start.")
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
          if (game.players.has(user.id)) return;
        
        game.addPlayer(user)
        
        msg.edit(
          new RichEmbed()
          .setColor(colors.demon)
          .setDescription("The Demon is being summoned! React with ⚔️ to join! \n"+message.author.username+", React with ✅ to start.")
          .addField("Players", "**"+ game.players.map(p => p.tag).join("\n") +"**")
        )
      } else {
        if (user.id != message.author.id) return;
        if (game.players.length == 0) return;
        return collector.stop()
      }
    })
    
    collector.on("end", () => {
      if (game.players.length < 1) return message.channel.send("No-one joined!")
      if (args[0] == "skip" && message.author.id == client.owner) return gemrain(game)
      
      game.init(true)
      fight()
    })
  })
  }
  
  function fight() {
    let enemy = game.spawnEnemy({
      name: "Demon",
      hp: 1882,
      damage: 66
    })
    
    let hp = enemy.hp
    game.target = {
      player: game.players.random()
    }
    
    let embed = new RichEmbed()
    .setTitle("Field of Battle")
    .setDescription("**A GIANT DEMON SPAWN APPEARED!!**\n\nReact to hit it! You have 10 minutes")
    .addField("Demon's HP", enemy.hp + "/" + hp)
    .addField("Your Team", "​"+ game.players.map(player => "**"+player.tag+"** - HP: "+ player.hp).join("\n"))
    .setColor(colors.demon)
    
    message.channel.send(embed).then(async msg => {
      await msg.react("⚔️")
      
      let filter = (r, user) => ["⚔️"].includes(r.emoji.name) && game.players.has(user.id)
      let collector = game.collector = msg.createReactionCollector(filter, {time: 600000})
      let enemydied = false
    
    
      let updatedmg = setInterval(() => {
        if (game.players.size > 0) {
          let player = game.players.random()
          game.attackPlayer(player, 10)
        
          if (player.hp <= 0) {
            message.channel.send("**" +player.tag+"** died! They respawn in 7 seconds...")
            game.respawnPlayer(player)
        }
      }
      
      msg.edit(
        new RichEmbed()
        .setTitle("Field of Battle")
        .setDescription("**A GIANT DEMON SPAWN APPEARED!!**\n\nReact to hit it! You have 10 minutes")
        .addField("Demon's HP", enemy.hp + "/" + hp)
        .addField("Your Team", "​"+ game.players.map(player => "**"+player.tag+"** - HP: "+ player.hp).join("\n"))
        .setColor(colors.demon)
      )
    }, 2100)
    
    
    
    collector.on("collect", r => {
      let user = r.users.last()
      
      let player = game.players.get(user.id)
      
      if (Math.random() > 0.15) game.attackEnemy(player)
      else game.attackEnemy(player, Math.ceil(player.damage / 3))
      
      if (enemy.hp <= 0) {
        return game.endCollector(msg, hp, updatedmg) // enemydied
      }
      
      if (Math.random() > 0.5) { // attack
        let targetplayer = game.target.player || game.players.first() || {}
        
        game.attackPlayer(targetplayer)
        if (targetplayer.hp <= 0) {
          message.channel.send("**"+targetplayer.tag+"** died! They respawn in 7 seconds..")
          game.target = {}
          game.respawnPlayer(targetplayer.user, 7000, (p) => !game.target.player ? game.target.player = p : game.target.player = game.players.random())
        }
      } // attack
      
      if (Math.random() > 0.97) { // fling    
        message.channel.send("**"+player.tag+"** got flung!")
        game.removePlayer(player, false)
        
        if (game.target.player.id == player.id) game.target.player = game.players.random()
        
        setTimeout(() => {
          message.channel.send("**"+player.tag+"** got lost in the void! They respawn in 7 seconds..")
        
          game.respawnPlayer(player.user, 7000, (p => game.target.player && game.players.has(game.target.player.id) ? undefined : game.target.player = p))       
        }, (Math.random() * 8999) + 1000)
      } // fling
    })
      
      collector.on("end", (_, reason) => {
        clearInterval(game.regen)
        if (reason != "enemydied") {
          client.game = null
          clearInterval(game.regen)
          return message.channel.send("You automatically lose, because you took too long.")
        }
        if (enemydied) message.channel.send("The Demon has been defeated!!! \n\nWait, it's raining... gems.")
        
        game.enemy = null
        game.collector = null
        
        gemrain()
      })
    })
  }
  
  function gemrain() {
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
    
    setTimeout(() => collectgem(game, gems), 4000)
  }
  
  function collectgem(game, gems) {
      let user = client.users.get(game.players.random().id)
      if (!user) return message.channel.send("The Gem Rain has been cancelled, due to not being able to find a user.")
      
      let jokes = [
        "Is it a Mithril, or a Copal 🤔",         
        "It's probably just a Spinel 😔",
        "I think thats a Fury Stone 👀", 
        "This better be a good gem 😩",
        "NO! They're gonna get it before me 😡",
        "I better get this gem 🤞",
        "I think I should just leave it 😬",
        "Oooh this looks shiny 🤩",
        "Please be a red, please be a reddd 🙏",
        "I don't think I should collect this gem... 😳"
      ]
      
      let embed = new RichEmbed()
      .setTitle("Gem Rain")
      .setDescription("You have spotted a gem! Do you want to collect it? You have 10 seconds to decide.")
      .setColor("RANDOM")
      .setFooter(jokes[Math.floor(Math.random() * jokes.length)] + " - Gem " + (26 - gems.length) + "/25")
      
      user.send(embed).then(async msg => {
       await msg.react("✅");
       await msg.react("❌")
        
        let filter = (reaction, u) => ["✅","❌"].includes(reaction.emoji.name) && u.id == user.id
        let collector = msg.createReactionCollector(filter, {time: 10000})
        let toolong = true
        let denied = false
        
        collector.on("collect", r => {
          if (r.emoji == "✅") {
            toolong = false
            let gem = gems[0]
            client.fob.add(`${user.id}.inventory.gems.${gem.code}`, 1)
            user.send("You got a "+gem.name+"! You now have "+ (client.fob.fetch(`${user.id}.inventory.gems.${gem.code}`)) + ".")
            if (gem.islegendary) {
              message.channel.send("**"+user.tag+" got a "+ gem.name +"!**")
            }
            gems.splice(0, 1)
            collector.stop()
          } else {
            user.send("You have decided not to collect this gem. Too bad, because it was a "+gems[0].name+"!")
            toolong = false
            denied = true
            collector.stop()
          }
        })
        
        collector.on("end", () => {
          if (denied || toolong) {
            let reason = denied ? "The person who was going for this gem changed their mind, so you got it." : " The person who was going for this gem was too slow, so you got it."
            let id = game.players.filter(u => u != user.id).random().id
            let newuser = game.players.size > 1 ? client.users.get(id) : client.users.get(game.players.random().id)
            console.log(id, client.users.has(id))
            
            let gem = gems[0]
            client.fob.add(`${newuser.id}.inventory.gems.${gem.code}`, 1)
            newuser.send(reason + "\n\nYou got a "+gem.name+"! You now have "+ (client.fob.fetch(`${newuser.id}.inventory.gems.${gem.code}`)) + ".")
            if (gem.islegendary) {
              message.channel.send("**"+newuser.tag+" got a "+ gem.name +"!**")
            }
            
            gems.splice(0, 1)
          }       
            if (gems.length <= 0) {
              client.game = null
              return message.channel.send(game.players.map(p => p.user.toString()).join(", ") + "\nThe Gem Rain is over!")
            } else {
             return setTimeout(() => collectgem(game, gems), 50)
            }
          
        })
      })
    }
}
}

module.exports = Demon