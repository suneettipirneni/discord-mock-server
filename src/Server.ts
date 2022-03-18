import { MockAPI } from './api/MockAPI';
import { DataStore } from './DataStore';
import { MockGateway, MockGatewayOptions } from './gateway/MockGateway';

export interface MockServerOptions {
  /**
   * Options for the mock gateway
   */
  gatewayOptions: MockGatewayOptions;
}

/**
 * Represents a full mock discord server (backend)
 */
export class MockDiscordServer {
  /**
   * The gateway associated with this server
   */
  public readonly gateway: MockGateway;
  /**
   * The API associated with this server
   */
  public readonly api: MockAPI;
  /**
   * The data store associated with this server
   */
  public readonly store: DataStore;

  constructor(options?: MockServerOptions) {
    this.store = new DataStore();
    this.gateway = new MockGateway(this.store, {
      port: 8080,
      ...options?.gatewayOptions,
    });
    this.api = new MockAPI(this.gateway, this.store);
  }

  /**
   * Gets the API hostname
   */
  public get apiURL() {
    return this.api.host;
  }

  /**
   * Starts this server
   */
  public async start() {
    await this.api.start();
  }

  /**
   * Stops this server
   */
  public async stop() {
    await this.api.close();
    await this.gateway.close();
  }
}
