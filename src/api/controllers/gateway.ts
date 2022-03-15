import { NextFunction, Request, Response } from 'express';
import { MockGateway } from '../../gateway/MockGateway';

export class GatewayController {
  private gateway: MockGateway;

  constructor(gateway: MockGateway) {
    this.gateway = gateway;
  }

  public getGatewayBot(req: Request, res: Response, next: NextFunction) {
    res.send({
      url: `ws://${this.gateway.WSURL}`,
      shards: 1,
      session_start_limit: {
        total: 1000,
        remaining: 999,
        reset_after: 14400000,
        max_concurrency: 1,
      },
    });
  }
}
