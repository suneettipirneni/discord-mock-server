import { NextFunction, Request, Response } from 'express';

export class InteractionController {
  interactionCallback(req: Request, res: Response, next: NextFunction) {
    res.sendStatus(204);
  }
}
