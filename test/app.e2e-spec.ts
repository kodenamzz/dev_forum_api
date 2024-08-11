import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import mongoose from 'mongoose';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeAll(() => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(
        `The environment is not test, please run test on test-server (the env is ${process.env.NODE_ENV})`,
      );
      console.log('{process.env.NODE_ENV', process.env.NODE_ENV === 'test');
      process.exit(1);
    }
    mongoose.connect(process.env.MONGODB_URL).then((conn) => {
      conn.connection.db
        .dropDatabase({
          dbName: 'dev_forum_test',
        })
        .then(() => {
          console.log('Database dropped successfully');
        })
        .catch((err) => {
          console.error('Error dropping database:', err);
          process.exit(1);
        });
    });
  });

  afterAll(() => mongoose.disconnect());

  describe('System', () => {
    it('/ (GET)', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
    it('/health (GET)', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .then((res) => {
          expect(res.body.status).toEqual('ok');
        });
    });
  });

  const question = {
    title: 'test title',
    content: 'test content',
    tags: ['react', 'nest'],
    author: '66a53f08f4635a2468623031',
  };
  describe('Questions', () => {
    it('/questions (POST)', () => {
      return request(app.getHttpServer())
        .post('/questions')
        .send(question)
        .expect(HttpStatus.CREATED)
        .then((res) => {
          expect(res.body.question._id).toBeDefined();
        });
    });

    it('/questions (GET)', () => {
      return request(app.getHttpServer())
        .get('/questions')
        .expect(200)
        .then((res) => {
          expect(res.body).toBeInstanceOf(Array);
          expect(res.body).not.toHaveLength(0);
        });
    });
  });

  const user = {
    clerkId: 'user_2kTjHBpsuz9oC4YeR3JsOPg52Uf',
    name: 'Abdulkode Pohlor',
    username: 'kodenamzz',
    email: 'abdkode.p@gmail.com',
    picture: 'https://placehold.co/600x400',
  };

  describe('Users', () => {
    it('/users (POST)', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send(user)
        .expect(HttpStatus.CREATED)
        .then((res) => {
          expect(res.body.user._id).toBeDefined();
          expect(res.body.user.clerkId).toEqual(user.clerkId);
          expect(res.body.user.name).toEqual(user.name);
        });
    });
    it('/users (GET)', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .then((res) => {
          expect(res.body.users).toBeInstanceOf(Array);
          expect(res.body.users).not.toHaveLength(0);
        });
    });
  });

  describe('Tags', () => {
    it('/tags (GET)', () => {
      return request(app.getHttpServer())
        .get('/tags')
        .expect(200)
        .then((res) => {
          expect(res.body.tags).toBeInstanceOf(Array);
          expect(res.body.tags).toHaveLength(question.tags.length);
        });
    });
  });
});
