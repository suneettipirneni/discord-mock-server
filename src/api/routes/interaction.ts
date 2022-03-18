import express from 'express';
import { InteractionController } from '../controllers/interaction';

const interactionRouter = express.Router();
const interactionController = new InteractionController();

interactionRouter.post(
  '/interactions/:interactionId/:interactionToken/callback',
  interactionController.interactionCallback
);

export { interactionRouter };
