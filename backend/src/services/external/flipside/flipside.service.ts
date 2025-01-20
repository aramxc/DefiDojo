import { Flipside, Query, QueryResultSet } from "@flipsidecrypto/sdk";
import { config } from '../../../config/constants';

export class FlipsideService {
  private flipside: Flipside;

  constructor() {
    this.flipside = new Flipside(
      config.flipside.apiKey || '',
      config.flipside.baseUrl 
    );
  }

  async getLearningResources(topic: string): Promise<QueryResultSet> {
    const query: Query = {
      sql: `
        SELECT 
          resource_url,
          resource_type,
          votes,
          creator_address
        FROM ethereum.learning_resources
        WHERE LOWER(topic) LIKE LOWER('%${topic}%')
        ORDER BY votes DESC
      `,
      maxAgeMinutes: 15, // Cache results for 15 minutes
      pageSize: 100,     // Adjust based on your needs
      timeoutMinutes: 10,
    };

    try {
      return await this.flipside.query.run(query);
    } catch (error) {
      console.error('Error fetching learning resources:', error);
      throw error;
    }
  }

  async getTopVotedContent(limit: number = 10): Promise<QueryResultSet> {
    const query: Query = {
      sql: `
        SELECT 
          resource_url,
          resource_type,
          votes,
          creator_address,
          topic
        FROM ethereum.learning_resources
        ORDER BY votes DESC
        LIMIT ${limit}
      `,
      maxAgeMinutes: 30,
      cached: true,
    };

    try {
      return await this.flipside.query.run(query);
    } catch (error) {
      console.error('Error fetching top voted content:', error);
      throw error;
    }
  }

  async getCreatorStats(creatorAddress: string): Promise<QueryResultSet> {
    const query: Query = {
      sql: `
        SELECT 
          COUNT(*) as total_resources,
          SUM(votes) as total_votes,
          AVG(votes) as avg_votes
        FROM ethereum.learning_resources
        WHERE LOWER(creator_address) = LOWER('${creatorAddress}')
      `,
      maxAgeMinutes: 15,
    };

    try {
      return await this.flipside.query.run(query);
    } catch (error) {
      console.error('Error fetching creator stats:', error);
      throw error;
    }
  }
}