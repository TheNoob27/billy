//const db = require('quick.db')
const Discord = require('discord.js')

module.exports.run = async (client, message, args, colors) => {

  let enemycount = 0
  setup()
  
  
function setup() {
  
  let game = {
    players: [],
    playerlist: [],
    rounds: null,
    team: null,
    enemyteam: []
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
          tag: user.tag,
          damage: 11
        })
        game.playerlist.push(user.id)
        
          players.push(user.tag)
        
        msg.edit(embed = new Discord.RichEmbed()
                 .setColor(colors.color)
                 .setDescription("A new game is starting! React with ⚔️ to join! \n React with ✅ to start, but the game will start automatically in 5 minutes.")
                 .addField("Players", "**"+ game.players.map(p => p.tag).join("\n") +"**")
                             )
      } else {
        if (user.id != message.author.id) return
        collector.stop()
      }
      
    })
    
    collector.on("end", () => {
      let rounds = Math.ceil(Math.random() * 5) + 10
      game.rounds = rounds
      let teams = ["Humans", "Orcs"]
      game.team = teams[Math.floor(Math.random() * teams.length)]
      let orcs = ["Grunt", "Smasher", "Warrior", "Assassin", "Blademaster", "Elite Blademaster", "Warlord", "Tyrant", "Mage", "Archer", "KorKron Elite"] //orcs
    let humans = ["Soldier", "Knight", "Assassin", "Captain", "Mage", "Archer", "Giant", "Guard", "Royal Guard"] // humans
    game.enemyteam = game.team == "Humans" ? orcs : humans
      
      message.channel.send("Game starting. There will be "+rounds+" enemies to fight and stuff, and ur on the "+ game.team+" team.")
      play(game)
    })
  })

  }
  
  function play(game) {
    let enemy = getenemy(game)
    let hp = enemy.hp
    
    let embed = new Discord.RichEmbed()
    .setTitle("Field of Battle")
    .addField("Enemy #"+(enemycount + 1), "You and your team have encountered a "+ enemy.name + "! Press the sword reaction to hit him.")
    .addField("Enemy's HP", enemy.hp + "/" + hp)
    .addField("Your Team", game.players.map(player => "**"+player.tag+"** - HP: "+ player.hp).join("\n"))
    
    message.channel.send(embed).then(async msg => {
      await msg.react("⚔️")
      
    let filter = (r, user) => ["⚔️"].includes(r.emoji.name) && game.playerlist.includes(user.id)
    let collector = msg.createReactionCollector(filter, {time: 20000})
    let alldied = false
    
    let updatedmg = setInterval(() => {
      msg.edit(new Discord.RichEmbed()
    .setTitle("Field of Battle")
    .addField("Enemy #"+(enemycount + 1), "You and your team have encountered a "+ enemy.name + "! Press the sword reaction to hit him.")
    .addField("Enemy's HP", enemy.hp + "/" + hp)
    .addField("Your Team", game.players.map(player => "**"+player.tag+"** - HP: "+ (player.hp < 0 ? 0 : player.hp)).join("\n"))
    )
    }, 5000)
    
    collector.on("collect", r => {
      let user = r.users.last()
      let player = game.players.find(p => p.id == user.id)
      enemy.hp -= player.damage
      
      if (Math.random() > 0.5) {
        player.hp -= enemy.damage
      if (player.hp <= 0) {
        message.channel.send("**"+player.tag+"** died!")
        for (var i = 0; i < game.players.length; i++) {
          if (game.players[i].id == user.id) game.players.slice(i, 1)
        }
        
        if (game.players.length < 1) {
          message.channel.send("Everyone died!")
        }
      }
      }
    })
      
    })
  }

  
  function getenemy(game) {
   /* let enemy = {
      name: null,
      hp: null,
      damage: null
    }
    */
    let enemies = game.enemyteam
    console.log(enemies)
   // enemy.name = enemies[Math.floor(Math.random() * enemies)]
    
    let e = enemies[Math.floor(Math.random() * enemies.length)] //enemy.name
    let hp = 0
    let damage = 0
    
    if (e == "Soldier" || e == "Grunt") {
      hp = 100
      damage = 11
    } else if (e == "Mage") {
      hp = 135
      damage = 16
    } else if (e == "Archer") {
      hp = 145
      damage = 15
    } else if (e == "Knight" || e == "Smasher") {
      hp = 169
      damage = 18
    } else if (e == "Captain" || e == "Warrior") {
      hp = 195
      damage = 22
    } else if (e == "Blademaster") {
      hp = 210
      damage = 25
    } else if (e == "Guard" || e == "Elite Blademaster") {
      hp = 235
      damage = 27
    } else if (e == "Warlord") {
      hp = 250
      damage = 28
    } else if (e == "Tyrant" || e == "Giant") {
      hp = 405
      damage = 33
    } else if (e == "KorKron Elite" || e == "Royal Guard") {
      hp = 300
      damage = 40
    }
    
    console.log({
      name: e,
      hp: hp,
      damage: damage
    })
    
    return {
      name: e,
      hp: hp,
      damage: damage
    }
  }
}
module.exports.help = {
  name: "play",
  aliases: ["battle"],
  description: "Play a game that is supposed to mimic FOB.",
  usage: `b!play`,
  category: "Soon"
}