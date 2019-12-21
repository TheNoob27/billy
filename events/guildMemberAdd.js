module.exports = (client, member) => {
let guild = member.guild
  
  if (guild.id !== "648056524094046239") return;
  if (member.user.bot) return member.addRole("648116894267867146")
  
  member.addRole("648072679684964352")
  }