module.exports = (client, r, user) => {
let message = r.message
  
  if (message.id !== "648164452297867305") return;
  
  let member = message.guild.member(user)
  
  
  if (r.emoji == "⚔️" || "⚔️".includes(r.emoji.name)) {
    if (!member.roles.has("648123633658626087")) return;
    member.removeRole("648123633658626087")
    user.send("You have been removed from the Demon Farmer role.")
  } else if (r.emoji == "🎉" || "🎉".includes(r.emoji.name)) {
    if (!member.roles.has("648156899509796871")) return;
    member.removeRole("648156899509796871")
    user.send("You have been removed from the Giveaway Ping role.")
  }
}