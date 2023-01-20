export const getBalance = async (instance, user, guild) => {
  let bal = 0
  const amt = await instance.redis.get(`rabbits:${guild}:${user.id}`)
  if (amt && !isNaN(amt)) bal = parseInt(amt)
  return bal
}

export const getGlobalBalance = async (instance, user) => {
  let bal = 0
  const amt = await instance.redis.get(`rabbits:${user.id}`)
  if (amt && !isNaN(amt)) bal = parseInt(amt)
  return bal
}

export const addBalance = async (instance, user, guild, amt) => {
  let bal = await getBalance(instance, user, guild)
  bal += amt
  await instance.redis.set(`rabbits:${guild}:${user.id}`, bal.toString())
  const g = instance.config.guilds[guild]
  console.log(
    `! Added ${amt} ${g.color} rabbits to ${user.tag} in ${g.name}, for a total of ${bal}`
  )
  return bal
}

export const addGlobalBalance = async (instance, user, amt) => {
  let bal = await getGlobalBalance(instance, user)
  bal += amt
  await instance.redis.set(`rabbits:${user.id}`, bal.toString())
  console.log(
    `! Added ${amt} rabbits to ${user.tag}, for a total of ${bal}`
  )
  return bal
}
