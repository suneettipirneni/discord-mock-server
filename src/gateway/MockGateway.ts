import {
  APIApplication,
  APIGuild,
  APIUser,
  GatewayDispatchEvents,
  GatewayOpcodes,
} from 'discord-api-types/v9';
import { RawData, Server, ServerOptions, WebSocket } from 'ws';
import { DataStore } from '../DataStore';

/**
 * Creates an gateway-compatible dispatch payload
 * @param event The event type of the dispatch
 * @param data The associated data of the event
 */
export function createDispatchData(
  event: GatewayDispatchEvents,
  data: Record<string, unknown>
) {
  return {
    t: event,
    d: { ...data },
  };
}

export interface MockGatewayOptions extends ServerOptions {
  /**
   * The guilds to send the bot after the IDENTIFY event
   */
  guilds?: APIGuild[];
  /**
   * The user associated with the connecting client
   */
  user?: APIUser;
  /**
   * The application associated with the connection client
   */
  application?: APIApplication;
}

/**
 * Represents a mock discord gateway
 */
export class MockGateway {
  private server: Server;
  private client!: WebSocket;
  private guilds: APIGuild[];
  private user?: APIUser;
  private application?: APIApplication;
  private store: DataStore;

  /**
   * @param store The data store used to store in-memory data
   * @param options The options for this mock gateway
   */
  public constructor(store: DataStore, options?: MockGatewayOptions) {
    this.server = new Server(options);
    this.guilds = options?.guilds ?? [];
    this.user = options?.user;
    this.application = options?.application;
    this.store = store;

    // Setup handling.
    this.server.on('connection', (client) => {
      this.handleNewConnection(client);
      this.client.on('message', (m) => this.handleMessage(client, m));
    });
  }

  /**
   * The host for this gateway server
   */
  public get WSURL() {
    return 'localhost:8080';
  }

  private sendGuilds(client: WebSocket) {
    this.guilds.forEach((guild) => {
      client.send(
        JSON.stringify(
          createDispatchData(GatewayDispatchEvents.GuildCreate, { ...guild })
        )
      );
    });
  }

  private identify(client: WebSocket) {
    client.send(
      JSON.stringify(
        createDispatchData(GatewayDispatchEvents.Ready, {
          v: 9,
          user: this.user,
          application: this.application,
          guilds: this.guilds,
        })
      )
    );

    // Send guilds
    this.sendGuilds(client);
  }

  private ACKHeartBeat(client: WebSocket) {
    client.send(JSON.stringify({ op: 11 }));
  }

  private handleMessage(client: WebSocket, payload: RawData) {
    const data = JSON.parse(payload.toString());
    switch (data.op) {
      case GatewayOpcodes.Identify:
        this.identify(client);
        break;
      case GatewayOpcodes.Heartbeat:
        this.ACKHeartBeat(client);
        break;
    }
  }

  private handleNewConnection(client: WebSocket) {
    client.send(
      JSON.stringify({
        op: 10,
        d: {
          heartbeat_interval: 45000,
        },
      })
    );
    this.client = client;
  }

  /**
   * Sends a dispatch (event) from this gateway
   * @param event The event type to dispatch
   * @param data The associated data to send with the event
   */
  public async dispatch(
    event: GatewayDispatchEvents,
    data: Record<string, unknown>
  ) {
    return new Promise<void>((resolve, reject) => {
      this.client.send(
        JSON.stringify(createDispatchData(event, data)),
        (err) => {
          if (err) {
            reject(err);
            return;
          }

          resolve();
        }
      );
    });
  }

  /**
   * Shuts this mock gateway down
   */
  public async close() {
    return new Promise<void>((resolve, reject) => {
      this.server.close((err) => {
        if (err) {
          return reject(err);
        }

        resolve();
      });
    });
  }
}
