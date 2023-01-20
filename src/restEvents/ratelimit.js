export const eventName = 'rateLimit'

export const execute = async (instance, params) => {
  if (instance.client.rest.globalTimeout) {
    console.error(`[${instance.sid}] ! GLOBAL RATELIMIT HIT`)
  }
  console.error(
    `[${instance.sid}] ! Hit ratelimit on '${params.method} ${params.route}' => timeout ${params.timeout}`
  )
}
