import {
  APIApplication,
  APIGuild,
  APIMessage,
  APIUser,
} from 'discord-api-types/v9';
import { GatewayDispatchEvents, GatewayOpcodes } from 'discord.js';
import { RawData, Server, ServerOptions, WebSocket } from 'ws';
import { DataStore } from '../DataStore';

function createDispatchData(
  event: GatewayDispatchEvents,
  data: Record<string, unknown>
) {
  return {
    t: event,
    d: { ...data },
  };
}

export interface MockGatewayOptions extends ServerOptions {
  guilds?: APIGuild[];
  user?: APIUser;
  application?: APIApplication;
}

export class MockGateway {
  private server: Server;
  private client!: WebSocket;
  private guilds: APIGuild[];
  private user?: APIUser;
  private application?: APIApplication;
  private store: DataStore;

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

  private identify(client: WebSocket, data: Record<string, unknown>) {
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
        this.identify(client, data);
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

  public async dispatchMessage(message: APIMessage) {
    return new Promise<void>((resolve, reject) => {
      this.client.send(
        JSON.stringify(
          createDispatchData(GatewayDispatchEvents.MessageCreate, {
            ...message,
          })
        ),
        (err) => {
          if (!err) {
            resolve();
          }

          reject(err);
        }
      );
    });
  }

  public close() {
    this.server.close();
  }
}
