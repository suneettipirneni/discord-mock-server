// const mockServer = new MockDiscordServer({ guilds: [mockGuild] });
// mockServer.start();

// (async () => {
//   const client = new Client({
//     rest: {
//       api: 'http://localhost:3000',
//     },
//     intents: [GatewayIntentBits.GuildMembers, GatewayIntentBits.Guilds],
//   });

//   client.on('debug', console.log);
//   client.on('messageCreate', (m) => console.log(m.content));

//   await client.login('fakeToken');

//   // @ts-expect-error test
//   mockServer.gateway.dispatchMessage({
//     id: '123567',
//     channel_id: mockChannel.id,
//     content: 'test message content',
//   });
// })();

export * from './api/MockAPI';
export * from './gateway/MockGateway';
export * from './DataStore';
export * from './Server';
