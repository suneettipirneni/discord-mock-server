import express, { Express } from 'express';
import { MockGateway } from '../gateway/MockGateway';
import { Server } from 'node:http';
import { channelRoutes } from './routes/channel';
import { gatewayRoutes } from './routes/gateway';
import { DataStore } from '../DataStore';

export class MockAPI {
  public restApplication: Express;
  public gatewayServer: MockGateway;
  public restServer?: Server;
  private store: DataStore;

  constructor(gatewayServer: MockGateway, store: DataStore) {
    this.restApplication = express();
    this.gatewayServer = gatewayServer;
    this.restApplication.use(
      '/v9',
      channelRoutes(gatewayServer, store),
      gatewayRoutes(gatewayServer)
    );
    this.store = store;
  }

  public get host() {
    return 'localhost:3000';
  }

  public start() {
    this.restServer = this.restApplication.listen(3000);
  }

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
