class PgApi {
  /**
   *
   * @param {pg.Pool} pool
   * @param {*} config
   */
  constructor(pool, config) {
    this.pool = pool;
    this.config = config;
  }
  async simpleQuery(table, object) {
    const values = Object.values(object);
    let query = `SELECT * FROM ${table} WHERE ${Object.keys(object)
      .map((e, index) => `${e}=$${index + 1}`)
      .join(" AND ")}`;
    return this.pool.query(query, values);
  }

  async simpleDelete(table, object) {
    const values = Object.values(object);
    let query = `DELETE FROM ${table} WHERE ${Object.keys(object)
      .map((e, index) => `${e}=$${index + 1}`)
      .join(" AND ")}`;
    return this.pool.query(query, values);
  }

  async simpleInsert(table, object) {
    const query = `INSERT INTO ${table} (${Object.keys(object).join(
      ", "
    )}) VALUES(${Object.keys(object)
      .map((entry, index) => `$${index + 1}`)
      .join(", ")}) RETURNING *`;
    const values = Object.values(object);
    return this.pool.query(query, values);
  }
  async simpleUpdate(table, query, update) {
    const updateValues = Object.values(update);

    const queryStr = `UPDATE ${table} SET ${Object.keys(update)
      .map((key, index) => `${key}=$${index + 1}`)
      .join(", ")} WHERE ${Object.keys(query)
      .map((e, index) => `${e}=$${index + 1 + updateValues.length}`)
      .join(" AND ")}`;
    const values = [...updateValues, ...Object.values(query)];
    return this.pool.query(queryStr, values);
  }

  async createTables() {
      await this.pool.query(
      'CREATE TABLE IF NOT EXISTS CLAIMS (id BIGSERIAL PRIMARY KEY, guild_name VARCHAR, guild_id VARCHAR, username VARCHAR, user_id VARCHAR, animal VARCHAR, color VARCHAR, time TIMESTAMPTZ)'
    );
         await this.pool.query(
      'CREATE TABLE IF NOT EXISTS TRANSACTIONS (id BIGSERIAL PRIMARY KEY, guild_name VARCHAR, guild_id VARCHAR, user_id VARCHAR, amount INT, reason VARCHAR DEFAULT null, time TIMESTAMPTZ)'
    );

    await this.pool.query(
      'CREATE TABLE IF NOT EXISTS TRADE_LOGS (id BIGSERIAL PRIMARY KEY, trade_id VARCHAR, source_id VARCHAR, target_id VARCHAR, color VARCHAR, animal VARCHAR, amount INT, time TIMESTAMPTZ)'
    );


  }
}
export default PgApi;
