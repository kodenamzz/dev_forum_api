import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      // connectionName: 'devDB',
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URL'),
        dbName: 'dev_forum',
        connectionFactory: (connection: Connection) => {
          connection.on('connected', () => {
            Logger.log('DB connected');
          });
          connection.on('disconnected', () => {
            Logger.log('DB disconnected');
          });
          connection.on('error', (err) => {
            Logger.error('DB connection failed', err);
          });
          return connection;
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
