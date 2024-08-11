import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';
import { QuestionsModule } from './questions/questions.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { TagsModule } from './tags/tags.module';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: !ENV ? '.env.development' : `.env.${ENV}`,
      isGlobal: true,
    }),
    DatabaseModule,
    HealthModule,
    UsersModule,
    QuestionsModule,
    WebhooksModule,
    TagsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
