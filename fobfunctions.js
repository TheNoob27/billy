
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
   else if (gemchance > 0.45) gem.name = uncommon[Math.floor(Math.random() * uncommon.length)] // 40% chance
   else gem.name = common[Math.floor(Math.random() * common.length)] // 45% chance
   
 } else {
   if (gemchance > 0.85) gem.name = rares[Math.floor(Math.random() * rares.length)] // 15% chance
   else if (gemchance > 0.45) gem.name = uncommon[Math.floor(Math.random() * uncommon.length)] // 40% chance
   else gem.name = common[Math.floor(Math.random() * common.length)]// 45% chance
 }
    gem.code = gem.name.replace(/ /g, "").toLowerCase()
    
    return gem
    }

}