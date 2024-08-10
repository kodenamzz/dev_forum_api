import { DeletedObjectJSON, UserJSON } from '@clerk/clerk-sdk-node';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class WebhooksService {
  constructor(private readonly usersService: UsersService) {}

  async handleUserCreated(eventData: UserJSON) {
    try {
      const {
        id,
        email_addresses,
        image_url,
        username,
        first_name,
        last_name,
      } = eventData;

      const [emailJson] = email_addresses;
      const mongoUser = await this.usersService.createUser({
        clerkId: id,
        name: `${first_name}${last_name ? ` ${last_name}` : ''}`,
        username: username!,
        email: emailJson.email_address,
        picture: image_url,
      });

      return mongoUser;
    } catch (error) {
      console.error('Error handling user.created event:', error.message);
      throw new InternalServerErrorException(
        'Failed to handle user.created event',
      );
    }
  }

  async handleUserUpdated(eventData: UserJSON) {
    try {
      const {
        id,
        email_addresses,
        image_url,
        username,
        first_name,
        last_name,
      } = eventData;

      const [emailJson] = email_addresses;
      const mongoUser = await this.usersService.updateUser({
        clerkId: id,
        name: `${first_name}${last_name ? ` ${last_name}` : ''}`,
        username: username!,
        email: emailJson.email_address,
        picture: image_url,
      });

      return mongoUser;
    } catch (error) {
      console.error('Error handling user.updated event:', error.message);
      throw new InternalServerErrorException(
        'Failed to handle user.updated event',
      );
    }
  }

  async handleUserDeleted(eventData: DeletedObjectJSON) {
    try {
      const { id } = eventData;

      const deletedUser = await this.usersService.deleteUser(id);

      return deletedUser;
    } catch (error) {
      console.error('Error handling user.deleted event:', error.message);
      throw new InternalServerErrorException(
        'Failed to handle user.deleted event',
      );
    }
  }
}
