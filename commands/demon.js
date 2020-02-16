const { getgem } = require("../fobfunctions.js")
const { RichEmbed } = require("discord.js")
const Command = require("../classes/Command.js")

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
    let game = {
    players: [],
    playerlist: [],
    regen: null
    }
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
        let find = game.players.find(player => player.id == user.id)
        if (find) return;
        
        let level = client.fob.fetch(`${user.id}.level.level`) || 1
        let inv = client.fob.fetch(`${user.id}.inventory`)
        game.players.push({
          id: user.id,
          level: level,
          hp: (18 * (level - 1) + 100) + inv.armour ? inv.armour.health || 0 : 0,
          tag: user.tag,
          damage: inv.sword ? inv.sword.damage || 8 : 8,
          maxhp: (18 * (level - 1) + 100) + inv.armour ? inv.armour.health || 0 : 0
        })
        game.playerlist.push(user.id)
        
          players.push(user.tag)
        
        msg.edit(embed = new RichEmbed()
  .setColor(colors.demon)
  .setDescription("The Demon is being summoned! React with ⚔️ to join! \n"+message.author.username+", React with ✅ to start.")
  .addField("Players", "**"+ game.players.map(p => p.tag).join("\n") +"**")
                             )
      } else {
        if (user.id != message.author.id) return;
        if (game.players.length == 0) return;
        collector.stop()
      }
      
    })
    
    collector.on("end", () => {
      if (game.players.length < 1) return message.channel.send("No-one joined!")
      if (args[0] == "skip" && message.author.id == client.owner) gemrain(game)
      else fight(game)
    })
  })
  }
  
  function fight(newgame) {
    if (newgame) game = newgame
    
    let times = 0
      game.regen = setInterval(() => { 
        console.log("Regen number "+ ++times)
    for (var i = 0; i < game.players.length; i++) {
      if (game.players[i].hp !== game.players[i].maxhp) game.players[i].hp += 2
    }
    }, 4000)
    
    
    let enemy = {
      name: "Demon",
      hp: 1882,
      damage: 66
    }
    let hp = enemy.hp
    let target = {
      player: game.players[Math.floor(Math.random() * game.players.length)]
    }
    
    let embed = new RichEmbed()
    .setTitle("Field of Battle")
    .setDescription("**A GIANT DEMON SPAWN APPEARED!!**\n\nReact to hit it! You have 8 minutes")
    .addField("Demon's HP", enemy.hp + "/" + hp)
    .addField("Your Team", "​"+ game.players.map(player => "**"+player.tag+"** - HP: "+ player.hp).join("\n"))
    .setColor(colors.demon)
    
    message.channel.send(embed).then(async msg => {
      await msg.react("⚔️")
      
    let filter = (r, user) => ["⚔️"].includes(r.emoji.name) && game.playerlist.includes(user.id)
    let collector = msg.createReactionCollector(filter, {time: 480000})
    let enemydied = false
    
    
    let updatedmg = setInterval(() => {
      if (game.players.length > 0) {
        let player = game.players[Math.floor(Math.random() * game.players.length)]
        player.hp -= 10
        if (client.fob.fetch(player.id + ".inventory.armour.name") == "Eternal Inferno") enemy.hp -= 10 * 0.15
        
        if (player.hp <= 0) {
          game.players.splice(game.players.indexOf(player), 1)
          game.playerlist.splice(game.playerlist.indexOf(player.id), 1)
          message.channel.send("**" +player.tag+"** died! They respawn in 7 seconds...")
          setTimeout(() => {
              let level = client.fob.fetch(`${player.id}.level.level`) || 1
              let inv = client.fob.fetch(`${player.id}.inventory`)
              let push = {
                id: player.id,
                level: level,
                hp: (18 * (level - 1) + 100) + inv.armour ? inv.armour.health || 0 : 0,
                tag: player.tag,
                damage: inv.sword ? inv.sword.damage || 8 : 8,
                maxhp: (18 * (level - 1) + 100) + inv.armour ? inv.armour.health || 0 : 0
              }
              game.players.push(push)
              game.playerlist.push(push.id)
              
            }, 7000)
        }
      }
      
      msg.edit(new RichEmbed()
    .setTitle("Field of Battle")
    .setDescription("**A GIANT DEMON SPAWN APPEARED!!**\n\nReact to hit it! You have 8 minutes")
    .addField("Demon's HP", enemy.hp + "/" + hp)
    .addField("Your Team", "​"+ game.players.map(player => "**"+player.tag+"** - HP: "+ player.hp).join("\n"))
    .setColor(colors.demon)
    )
    }, 2000)
    
    
    
    collector.on("collect", r => {
      let user = r.users.last()
      let player = game.players.find(p => p.id == user.id)
      if (Math.random() > 0.15) enemy.hp -= player.damage
      else enemy.hp -= Math.ceil(player.damage / 3)
      
      if (enemy.hp <= 0) {
        clearInterval(updatedmg)
        msg.edit(new RichEmbed()
    .setTitle("Field of Battle")
    .setDescription("**The Demon has been defeated!!**")
    .addField("Demon's HP", "0/" + hp)
    .addField("Your Team", "​"+ game.players.map(player => "**"+player.tag+"** - HP: "+ player.hp).join("\n"))
    .setColor(colors.color)
    )
        enemydied = true
        return collector.stop()
      }
      
      if (Math.random() > 0.5) { // attack
        let targetplayer = target.player
        
        target.player.hp -= enemy.damage
        if (client.fob.fetch(target.player.id + ".inventory.armour.name") == "Eternal Inferno") enemy.hp -= enemy.damage * 0.15
      if (target.player.hp <= 0) {
        message.channel.send("**"+target.player.tag+"** died! They respawn in 7 seconds..")
        for (var i = 0; i < game.playerlist.length; i++) {
          if (game.playerlist[i] == target.player.id) {
            
            game.players.splice(i, 1)
            game.playerlist.splice(i, 1)
            setTimeout(() => {
              let player = targetplayer
              
              let level = client.fob.fetch(`${player.id}.level.level`) || 1
              let inv = client.fob.fetch(`${player.id}.inventory`)
              let push = {
                id: player.id,
                level: level,
                hp: (18 * (level - 1) + 100) + inv.armour ? inv.armour.health || 0 : 0,
                tag: player.tag,
                damage: inv.sword ? inv.sword.damage || 8 : 8,
                maxhp: (18 * (level - 1) + 100) + inv.armour ? inv.armour.health || 0 : 0
              }
              game.players.push(push)
              game.playerlist.push(push.id)
              
              target = {
              player: game.players[Math.floor(Math.random() * game.players.length)]
            }
            }, 7000)
          
            break;
          }
        }
        
      }
      } // attack
      
      if (Math.random() > 0.97) { // fling
        let current = target.player
        
        message.channel.send("**"+player.tag+"** got flung!")
        for (var i = 0; i < game.playerlist.length; i++) {
          if (game.playerlist[i] == user.id) {
            game.playerlist.splice(i, 1)
            game.players.splice(i, 1)
          }
        }
        
        if (!target.player && game.playerlist.length) {
          target = {
            player: game.players[Math.floor(Math.random() * game.players.length)]
          };
        }
        
        setTimeout(() => {
          message.channel.send("**"+player.tag+"** died! They respawn in 7 seconds..")
        
            setTimeout(() => {
              let level = client.fob.fetch(`${player.id}.level.level`) || 1
              let inv = client.fob.fetch(`${player.id}.inventory`)
              let push = {
                id: player.id,
                level: level,
                hp: (18 * (level - 1) + 100) + inv.armour ? inv.armour.health || 0 : 0,
                tag: player.tag,
                damage: inv.sword ? inv.sword.damage || 8 : 8,
                maxhp: (18 * (level - 1) + 100) + inv.armour ? inv.armour.health || 0 : 0
              }
              game.players.push(push)
              game.playerlist.push(push.id)
            }, 7000)
            
        }, (Math.random() * 8999) + 1000)
      } // fling
    })
      
      collector.on("end", () => {
        clearInterval(game.regen)
        if (!enemydied) {
          clearInterval(game.regen)
          return message.channel.send("You automatically lose, because you took too long.")
        }
        if (enemydied) message.channel.send("The Demon has been defeated!!! \n\nWait, it's raining... gems.")
       
        gemrain(game)
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
    
   setTimeout(() => collectgem(game, gems), 4000)
  }
  
  function collectgem(game, gems) {
      let user = client.users.get(game.playerlist[Math.floor(Math.random() * game.playerlist.length)])
      
      let jokes = ["Is it a Mithril, or a Copal 🤔", 
                   "It's probably just a Spinel 😔",
                   "I think thats a Fury Stone 👀", 
                   "This better be a good gem 😩",
                  "NO! They're gonna get it before me 😡",
                  "I better get this gem 🤞",
                  "I think I should just leave it 😬",
                  "Oooh this looks shiny 🤩",
                  "Please be a red, please be a reddd 🙏",
                  "I don't think I should collect this gem... 😳"]
      
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
            let id = game.playerlist.filter(u => u != user.id)[Math.floor(Math.random() * (game.playerlist.length - 1))]
            let newuser = game.playerlist.length > 1 ? client.users.get(id) : client.users.get(game.playerlist[Math.floor(Math.random() * game.playerlist.length)])
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
              return message.channel.send("The Gem Rain is over!")
            } else {
             return setTimeout(() => collectgem(game, gems), 50)
            }
          
        })
      })
    }
}
}

module.exports = Demon