import { APIGuild } from 'discord-api-types/v9';
import { MockAPI } from './api/MockAPI';
import { DataStore } from './DataStore';
import { MockGateway } from './gateway/MockGateway';

export interface MockServerOptions {
  guilds: APIGuild[];
}

export class MockDiscordServer {
  public readonly gateway: MockGateway;
  public readonly api: MockAPI;
  public readonly store: DataStore;

  constructor(options?: MockServerOptions) {
    this.store = new DataStore();
    this.gateway = new MockGateway(this.store, {
      port: 8080,
      guilds: options?.guilds ?? [],
    });
    this.api = new MockAPI(this.gateway, this.store);
  }

  public get apiURL() {
    return this.api.host;
  }

  public start() {
    this.api.start();
  }

  public async stop() {
    await this.api.close();
    this.gateway.close();
  }
}
