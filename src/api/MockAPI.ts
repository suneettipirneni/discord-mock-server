import express, { Express } from 'express';
import { MockGateway } from '../gateway/MockGateway';
import { Server } from 'node:http';
import { channelRoutes } from './routes/channel';
import { gatewayRoutes } from './routes/gateway';
import { DataStore } from '../DataStore';
import { interactionRouter } from './routes/interaction';

/**
 * Represents a mocked version of the discord API
 */
export class MockAPI {
  private restApplication: Express;
  private gatewayServer: MockGateway;
  private restServer?: Server;
  private store: DataStore;

  /**
   * @param gatewayServer The mock gateway server to interface with
   * @param store The data store used to store in-memory data
   * @param version The API version to use
   */
  constructor(gatewayServer: MockGateway, store: DataStore, version = 10) {
    this.restApplication = express();
    this.gatewayServer = gatewayServer;
    this.restApplication.use(
      `/v${version}`,
      channelRoutes(gatewayServer, store),
      gatewayRoutes(gatewayServer),
      interactionRouter
    );
    this.store = store;
  }

  /**
   * The host name of this mock API
   */
  public get host() {
    return 'localhost:3000';
  }

  /**
   * Starts the mock API
   */
  public async start() {
    return new Promise<void>((resolve) => {
      this.restServer = this.restApplication.listen(3000, resolve);
    });
  }

  /**
   * Shuts this mock API down
   */
  public async close() {
    return new Promise<void>((resolve, reject) => {
      if (!this.restServer) {
        return resolve();
      }

      this.restServer.close((err) => {
        if (err) {
          return reject(err);
        }

        resolve();
      });
    });
  }
}
