module.exports = ({ Structures }) => {
  Structures.extend("MessageReaction", Reaction => {
    return class MessageReaction extends Reaction {
      _add(user) {
        if (this.partial) return false
        this.users.cache.set(user.id, user)
        if (user.id === this.message.client.user.id && !this.me) {
          this.me = true
          this.count++
        } else if (user.id !== this.message.client.user.id) this.count++
      }

      _remove(user) {
        if (this.partial) return
        this.users.cache.delete(user.id)
        if (user.id === this.message.client.user.id && this.me) {
          this.me = false
          this.count--
        } else if (user.id !== this.message.client.user.id) this.count--
        if (this.count <= 0 && this.users.cache.size === 0)
          this.message.reactions.cache.delete(this.emoji.id || this.emoji.name)
      }
    }
  })
}
