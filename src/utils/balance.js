export const getBalance = async (instance, user, guild) => {
  let bal = 0
  const amt = await instance.redis.get(`rabbits:${guild}:${user.id}`)
  if (amt && !isNaN(amt)) bal = parseInt(amt)
  return bal
}

export const getGlobalBalance = async (instance, user) => {
  const stored = await instance.redis.get(`animals:${user.id}`)
  const parsed = JSON.parse(stored) || {}
  const stats = {}
  instance.config.animals.forEach(animal => (stats[animal] = parsed[animal] || 0))
  return stats
}

export const addBalance = async (instance, user, guild) => {
  let bal = await getBalance(instance, user, guild)
  bal += 1
  await instance.redis.set(`rabbits:${guild}:${user.id}`, bal.toString())
  const g = instance.config.guilds[guild]
  console.log(
    `! Added a ${g.color} rabbit to ${user.tag} in ${g.name}, for a total of ${bal}`
  )
  return bal
}

export const addGlobalBalance = async (instance, user, animal) => {
  const stats = await getGlobalBalance(instance, user)
  stats[animal] += 1
  await instance.redis.set(`animals:${user.id}`, JSON.stringify(stats))
  console.log(
    `! Added a ${animal} to ${user.tag}, for a total of` +
    `${stats[animal]} ${animal} and ${Object.values(stats).reduce((a, b) => a + b)} animals`
  )
  return bal
}
