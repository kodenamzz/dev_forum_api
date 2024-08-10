import { WebhookEvent } from '@clerk/clerk-sdk-node';
import { Controller, Post, RawBodyRequest, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { UsersService } from '../users/users.service';
import { Webhook } from 'svix';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly usersService: UsersService) {}

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

    const eventType = evt.type;

    if (eventType === 'user.created') {
      const {
        id,
        email_addresses,
        image_url,
        username,
        first_name,
        last_name,
      } = evt.data;

      // Create a new user in your database
      const mongoUser = await this.usersService.createUser({
        clerkId: id,
        name: `${first_name}${last_name ? ` ${last_name}` : ''}`,
        username: username!,
        email: email_addresses[0].email_address,
        picture: image_url,
      });

      return res.status(200).json({ message: 'OK', user: mongoUser });
    }

    if (eventType === 'user.updated') {
      const {
        id,
        email_addresses,
        image_url,
        username,
        first_name,
        last_name,
      } = evt.data;

      // Create a new user in your database
      const mongoUser = await this.usersService.updateUser({
        clerkId: id,
        name: `${first_name}${last_name ? ` ${last_name}` : ''}`,
        username: username!,
        email: email_addresses[0].email_address,
        picture: image_url,
      });

      return res.status(200).json({ message: 'OK', user: mongoUser });
    }

    if (eventType === 'user.deleted') {
      const { id } = evt.data;

      const deletedUser = await this.usersService.deleteUser(id);

      return res.status(200).json({ message: 'OK', user: deletedUser });
    }

    return res.status(200).json({ message: 'OK' });
  }
}
