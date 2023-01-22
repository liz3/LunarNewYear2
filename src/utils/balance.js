export const getBalance = async (instance, user, guild) => {
  const { rows } = await instance.db.pool.query(
    "SELECT SUM(amount) as total FROM TRANSACTIONS WHERE user_id=$1 AND guild_id=$2",
    [user.id, guild.id]
  )
  return rows[0].total ?? 0;
}

export const getGlobalBalance = async (instance, user) => {
  const { rows } = await instance.db.pool.query(
    "SELECT SUM(amount) as total FROM TRANSACTIONS WHERE user_id=$1",
    [user.id]
  )
  return rows[0].total ?? 0;
}

export const addBalance = async (instance, user, guild, amount = 1, reason = null) => {
  await instance.db.simpleInsert("TRANSACTIONS", {
    guild_name: guild.name,
    guild_id: guild.id,
    user_id: user.id,
    amount,
    time: new Date(),
    reason,
  })
}

export const getProgress = (instance, user, guild_id = null) => {
  const o = {
    user_id: user.id
  }
  if (guild_id !== null) {
    o.guild_id = guild_id
  }
  return instance.db.simpleQuery("CLAIMS", o)
}
