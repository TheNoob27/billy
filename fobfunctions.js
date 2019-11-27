
module.exports = {
  getgem: function(legendaries) {
    let gem = {
      name: null,
      code: undefined,
      islegendary: false
    }
    
    
 let legends = [
      "Mithril",
      "Demonite",
      "Fury Stone",
      "Spirit Shard",
      "Dragon Bone",
   ],
    rares = [
      "Red Diamond",
      "Grandidierite",
      "Poudretteite",
      "Benitoite"
    ],
    uncommon = [
      "Tanzanite",
      "Alexandrite",
      "Diamond",
      "Sapphire",
      "Ruby",
      "Lapis Lazuli"
    ], 
    common = [
      "Topaz",
      "Garnet",
      "Aquamarine",
      "Spinel",
      "Amber",
      "Titanite",
      "Tourmaline",
      "Kunzite",
      "Amethyst",
      "Citrine",
      "Peridot",
      "Iolite",
      "Onyx",
      "Turquoise",
      "Malachite",
      "Feldspar",
      "Jade",
      "Nephrite",
      "Olivine",
      "Copal"
    ]
    
 let gemchance = Math.random()
 
 if (legendaries) {
   if (gemchance > 0.95) {
     
     gem.name = legends[Math.floor(Math.random() * legends.length)] // 5% chance
     gem.islegendary = true
     
   } else if (gemchance > 0.85) gem.name = rares[Math.floor(Math.random() * rares.length)] // 10% chance
   else if (gemchance > 0.5) gem.name = uncommon[Math.floor(Math.random() * uncommon.length)] // 35% chance
   else gem.name = common[Math.floor(Math.random() * common.length)] // 50% chance
   
 } else {
   if (gemchance > 0.85) gem.name = rares[Math.floor(Math.random() * rares.length)] // 15% chance
   else if (gemchance > 0.5) gem.name = uncommon[Math.floor(Math.random() * uncommon.length)] // 35% chance
   else gem.name = common[Math.floor(Math.random() * common.length)]// 50% chance
 }
    gem.code = gem.name.replace(/ /g, "").toLowerCase()
    
    return gem
    },
  
  addxp: async function xp(message, xptoadd = 0, db) {
  let level = await db.fetch(`level_${message.author.id}`)
 if (level === null) {
   db.set(`level_${message.author.id}`, 1)
   level = await db.fetch(`level_${message.author.id}`)
 }
  async function levelup() {
  db.add(`level_${message.author.id}`, 1)
  let newlevel = await db.fetch(`level_${message.author.id}`)
  let lvlup = new RichEmbed()
  .setTitle("🎉 You levelled up! 🎉")
  .setDescription("You have levelled up! You are now level " + newlevel + '!')
  .setTimestamp()
  .setColor("#f556dd")
  .setFooter(message.author.username, message.author.displayAvatarURL)
  
  message.channel.send(lvlup)
  } 
  
    db.add(`xp_${message.author.id}`, xptoadd)
 let xp = await db.fetch(`xp_${message.author.id}`)
 
  if (level == 1) {
    if (xp >= 10) levelup()
 
  } else if (level == 2) {
    if (xp >= 25) levelup()
    
  } else if (level == 3) {
    if (xp >= 50) levelup()
    
  } else if (level == 4) {
    if (xp >= 125) levelup()
    
  } else if (level == 5) {
    if (xp >= 200) levelup()
    
  } else if (level == 6) {
    if (xp >= 266) levelup()
    
  } else if (level == 7) {
    if (xp >= 330) levelup()
    
  } else if (level == 8) {
    if (xp >= 457) levelup()
    
  } else if (level == 9) {
    if (xp >= 525) levelup()
    
  } else if (level == 10) {
    if (xp >= 608) levelup()
    
  } else if (level == 11) {
    if (xp >= 860) levelup()
 
  } else if (level == 12) {
    if (xp >= 1080) levelup()
    
  } else if (level == 13) {
    if (xp >= 1648) levelup()
    
  } else if (level == 14) {
    if (xp >= 4069) levelup()
    
  } else if (level == 15) {
    if (xp >= 7025) levelup()
    
  } else if (level == 16) {
    if (xp >= 10607) levelup()
    
  } else if (level == 17) {
    if (xp >= 13796) levelup()
    
  } else if (level == 18) {
    if (xp >= 17693) levelup()
    
  } else if (level == 19) {
    if (xp >= 20175) levelup()
    
  } else if (level == 20) {
    if (xp >= 22650) levelup()
    
  } else if (level == 21) {
    if (xp >= 30869) levelup()
    
  } else if (level == 22) {
    if (xp >= 57920) levelup()
 
  } else if (level == 23) {
    if (xp >= 80916) levelup()
    
  } else if (level == 24) {
    if (xp >= 108203) levelup()
    
  } else if (level == 25) {
    if (xp >= 127349) levelup()
    
  } else if (level == 26) {
    if (xp >= 151089) levelup()
    
  } else if (level == 27) {
    if (xp >= 199999) levelup()
    
  } else if (level == 28) {
    if (xp >= 261869) levelup()
    
  } else if (level == 29) {
    if (xp >= 308108) levelup()
    
  } else if (level == 30) {
    if (xp >= 376190) levelup()
    
  } else if (level == 31) {
    if (xp >= 418301) levelup()
    
  } else if (level == 32) {
    if (xp >= 425639) levelup()
    
  } else if (level == 33) {
    if (xp >= 430615) levelup()
 
  } else if (level == 34) {
    if (xp >= 571820) levelup()
    
  } else if (level == 35) {
    if (xp >= 658442) levelup()
    
  } else if (level == 36) {
    if (xp >= 811739) levelup()
    
  } else if (level == 37) {
    if (xp >= 1009108) levelup()
    
  } else if (level == 38) {
    if (xp >= 1231376) levelup()
    
  } else if (level == 39) {
    if (xp >= 1522833) levelup()
    
  } else if (level == 40) {
    if (xp >= 1860284) levelup()
    
  } else if (level == 41) {
    if (xp >= 2274907) levelup()
    
  } else if (level == 42) {
    if (xp >= 2913905) levelup()
    
  } else if (level == 43) {
    if (xp >= 3618307) levelup()
    
  } else if (level == 44) {
    if (xp >= 4141599) levelup()
 
  } else if (level == 45) {
    if (xp >= 4816390) levelup()
    
  } else if (level == 46) {
    if (xp >= 6352997) levelup()
    
  } else if (level == 47) {
    if (xp >= 8247291) levelup()
    
  } else if (level == 48) {
    if (xp >= 9311344) levelup()
    
  } else if (level == 49) {
    if (xp >= 13096582) {
    db.add(`level_${message.author.id}`, 1)
      db.add(`money_${message.author.id}`, 100000)
    let newbalance = await db.fetch(`money_${message.author.id}`)
    let lvl100embed = new RichEmbed()
    .setTitle("🎉 **Level 50!** 🎉")
    .setDescription("You reached level 50!! Congratulations! Here is 100k gold, to thank you for the amount of effort you put into this bot to reach level 50. The amount of XP you earned, on a Discord bot that might not even work in a few years, but you still cared. Gamenstuff and I want to thank you for playing this and enjoying it.")
    .addField("New Balance", newbalance)
    .setColor("#f556dd")
    .setTimestamp()
    .setFooter("Congratulations!", message.author.displayAvatarURL)
    message.channel.send(lvl100embed)
    }
    
  } 
  
}

}