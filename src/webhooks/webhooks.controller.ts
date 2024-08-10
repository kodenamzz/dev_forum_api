import { WebhookEvent } from '@clerk/clerk-sdk-node';
import {
  Controller,
  InternalServerErrorException,
  Logger,
  Post,
  RawBodyRequest,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Webhook } from 'svix';
import { WebhooksService } from './webhooks.service';
import { UserDocument } from '../database/schemas/user.schema';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  async clerkWebhookHandler(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
  ) {
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
      throw new Error('You need a WEBHOOK_SECRET in your .env');
    }

    // Get the headers and body
    const headers = req.headers;
    const payload = req.rawBody;

    const svix_id = headers['svix-id'] as string;
    const svix_timestamp = headers['svix-timestamp'] as string;
    const svix_signature = headers['svix-signature'] as string;

    // If there are no Svix headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response('Error occured -- no svix headers', {
        status: 400,
      });
    }

    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: WebhookEvent;

    // Attempt to verify the incoming webhook
    // If successful, the payload will be available from 'evt'
    // If the verification fails, error out and  return error code
    try {
      evt = wh.verify(payload, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.log('Error verifying webhook:', err.message);
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    // Do something with the payload

    try {
      const eventType = evt.type;
      let result: UserDocument;

      Logger.debug(`eventType -> ${eventType}`);
      switch (eventType) {
        case 'user.created':
          result = await this.webhooksService.handleUserCreated(evt.data);
          break;
        case 'user.updated':
          result = await this.webhooksService.handleUserUpdated(evt.data);
          break;
        case 'user.deleted':
          result = await this.webhooksService.handleUserDeleted(evt.data);
          break;
        default:
          return res.status(200).json({ message: 'Event type not handled' });
      }

      return res.status(200).json({ message: 'OK', result });
    } catch (error) {
      console.error('Error handling webhook event:', error.message);
      throw new InternalServerErrorException('Failed to handle webhook event');
    }
  }
}
