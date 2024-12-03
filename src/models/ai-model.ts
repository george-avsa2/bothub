import client from '../database';

export type AIModel = {
  id: number;
  name: string;
  costPer100Tokens: number;
  apiToken: string;
  apiUrl: string;
};

export class AIModelStore {
  async getModelById(id: number): Promise<AIModel | null> {
    const conn = await client.connect();
    try {
      const sql = 'SELECT * FROM ai_models WHERE id = $1';
      const result = await conn.query(sql, [id]);

      if (result.rows.length) {
        const row = result.rows[0];
        return {
          id: row.id,
          name: row.name,
          costPer100Tokens: parseFloat(row.cost_per_100_tokens),
          apiToken: row.api_token,
          apiUrl: row.api_url
        };
      }
      return null;
    } catch (err) {
      throw new Error(`Cannot fetch model with ID ${id}. ${err}`);
    } finally {
      conn.release();
    }
  }

  async createModel(
    name: string,
    costPer100Tokens: number,
    apiToken: string,
    apiUrl: string
  ): Promise<AIModel> {
    const conn = await client.connect();
    try {
      const sql =
        'INSERT INTO ai_models (name, cost_per_100_tokens, api_token, api_url) VALUES ($1, $2, $3, $4) RETURNING *';
      const result = await conn.query(sql, [
        name,
        costPer100Tokens,
        apiToken,
        apiUrl
      ]);

      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        costPer100Tokens: parseFloat(row.cost_per_100_tokens),
        apiToken: row.api_token,
        apiUrl: row.api_url
      };
    } catch (err) {
      throw new Error(`Cannot create model. ${err}`);
    } finally {
      conn.release();
    }
  }
}
