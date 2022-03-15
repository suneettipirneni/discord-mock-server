import { Routes } from 'discord-api-types/v9';
import express from 'express';
import { DataStore } from '../../DataStore';
import { MockGateway } from '../../gateway/MockGateway';
import { ChannelController } from '../controllers/channel';

export function channelRoutes(gateway: MockGateway, store: DataStore) {
  const channelRouter = express.Router();
  const controller = new ChannelController(gateway, store);

  // Routes
  channelRouter.get(
    '/channels/channelId/messages/:messageId',
    controller.getMessage
  );
  channelRouter.post(`/channels/:channelId/messages`);

  return channelRouter;
}
