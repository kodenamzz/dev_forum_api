import { Test, TestingModule } from '@nestjs/testing';
import { CanActivate, HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import mongoose from 'mongoose';
import { ClerkAuthGuard } from '../src/clerk-auth/clerk-auth.guard';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const mock_ForceFailGuard: CanActivate = {
      canActivate: jest.fn(() => true),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue(mock_ForceFailGuard)
      .compile();

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
    it('(GET) /', () => {
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

  // USER --------------------------
  const user = {
    clerkId: 'user_2kTjHBpsuz9oC4YeR3JsOPg52Uf',
    name: 'Abdulkode Pohlorr',
    username: 'kodenamzz',
    email: 'abdkode.p@gmail.com',
    picture: 'https://placehold.co/600x400',
  };

  let createdUser = null;

  describe('Users', () => {
    it('(POST) /users', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send(user)
        .expect(HttpStatus.CREATED)
        .then((res) => {
          createdUser = res.body.user;
          expect(res.body.user._id).toBeDefined();
          expect(res.body.user.clerkId).toEqual(user.clerkId);
          expect(res.body.user.name).toEqual(user.name);
        });
    });
    it('(GET) /users', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .then((res) => {
          expect(res.body.users).toBeInstanceOf(Array);
          expect(res.body.users).not.toHaveLength(0);
        });
    });
  });

  // QUESTION --------------------------
  let question = {
    title: 'test title',
    content: 'test content',
    tags: ['react', 'nest'],
    author: '',
  };

  let createdQuestion = null;
  describe('Questions', () => {
    question = {
      ...question,
      author: createdUser?._id,
    };
    it('(POST) /questions', () => {
      return request(app.getHttpServer())
        .post('/questions')
        .send(question)
        .expect(HttpStatus.CREATED)
        .then((res) => {
          createdQuestion = res.body.question;
          expect(res.body.question._id).toBeDefined();
        });
    });

    it('(GET) /questions', () => {
      return request(app.getHttpServer())
        .get('/questions')
        .expect(200)
        .then((res) => {
          expect(res.body).toBeInstanceOf(Array);
          expect(res.body).not.toHaveLength(0);
        });
    });

    it('(GET) /questions/id', () => {
      return request(app.getHttpServer())
        .get(`/questions/${createdQuestion._id}`)
        .expect(200)
        .then((res) => {
          expect(res.body._id).toBeDefined();
          expect(res.body._id).toEqual(createdQuestion._id);
        });
    });

    it('(PUT) /questions/upvote [not upvoted before]', () => {
      return request(app.getHttpServer())
        .put(`/questions/upvote`)
        .send({
          questionId: createdQuestion._id,
          userId: createdUser._id,
          hasupVoted: false,
          hasdownVoted: false,
        })
        .expect(200)
        .then((res) => {
          expect(res.body.upvotes).toContain(createdUser._id);
        });
    });
    it('(PUT) /questions/upvote [had upvoted before]', () => {
      return request(app.getHttpServer())
        .put(`/questions/upvote`)
        .send({
          questionId: createdQuestion._id,
          userId: createdUser._id,
          hasupVoted: true,
          hasdownVoted: false,
        })
        .expect(200)
        .then((res) => {
          expect(res.body.upvotes).not.toContain(createdUser._id);
        });
    });
    it('(PUT) /questions/downvote [not downvoted before]', () => {
      return request(app.getHttpServer())
        .put(`/questions/downvote`)
        .send({
          questionId: createdQuestion._id,
          userId: createdUser._id,
          hasupVoted: false,
          hasdownVoted: false,
        })
        .expect(200)
        .then((res) => {
          expect(res.body.downvotes).toContain(createdUser._id);
        });
    });
    it('(PUT) /questions/downvote [had downvoted before]', () => {
      return request(app.getHttpServer())
        .put(`/questions/downvote`)
        .send({
          questionId: createdQuestion._id,
          userId: createdUser._id,
          hasupVoted: false,
          hasdownVoted: true,
        })
        .expect(200)
        .then((res) => {
          expect(res.body.downvotes).not.toContain(createdUser._id);
        });
    });
  });

  // ANSWER --------------------------

  let answerData = {
    author: '',
    content:
      'create a new answer will create a new instance of the Answer model but will not save it to the database',
    question: '',
  };
  describe('Answers', () => {
    let createdAnswerId = '';
    it('(POST) /answers', () => {
      answerData = {
        ...answerData,
        author: createdUser?._id,
        question: createdQuestion?._id,
      };
      return request(app.getHttpServer())
        .post('/answers')
        .send(answerData)
        .expect(HttpStatus.CREATED)
        .then((res) => {
          createdAnswerId = res.body.answer._id;
          expect(res.body.answer._id).toBeDefined();
        });
    });
    it('(GET) /answers', () => {
      return request(app.getHttpServer())
        .get(`/answers?questionId=${createdQuestion?._id}`)
        .expect(200)
        .then((res) => {
          expect(res.body.answers).toBeInstanceOf(Array);
          expect(res.body.answers).not.toHaveLength(0);
        });
    });

    it('(PUT) /answers/upvote [not upvoted before]', () => {
      return request(app.getHttpServer())
        .put(`/answers/upvote`)
        .send({
          answerId: createdAnswerId,
          userId: createdUser._id,
          hasupVoted: false,
          hasdownVoted: false,
        })
        .expect(200)
        .then((res) => {
          expect(res.body.upvotes).toContain(createdUser._id);
        });
    });
    it('(PUT) /answers/upvote [had upvoted before]', () => {
      return request(app.getHttpServer())
        .put(`/answers/upvote`)
        .send({
          answerId: createdAnswerId,
          userId: createdUser._id,
          hasupVoted: true,
          hasdownVoted: false,
        })
        .expect(200)
        .then((res) => {
          expect(res.body.upvotes).not.toContain(createdUser._id);
        });
    });
    it('(PUT) /answers/downvote [not downvoted before]', () => {
      return request(app.getHttpServer())
        .put(`/answers/downvote`)
        .send({
          answerId: createdAnswerId,
          userId: createdUser._id,
          hasupVoted: false,
          hasdownVoted: false,
        })
        .expect(200)
        .then((res) => {
          expect(res.body.downvotes).toContain(createdUser._id);
        });
    });
    it('(PUT) /answers/downvote [had downvoted before]', () => {
      return request(app.getHttpServer())
        .put(`/answers/downvote`)
        .send({
          answerId: createdAnswerId,
          userId: createdUser._id,
          hasupVoted: false,
          hasdownVoted: true,
        })
        .expect(200)
        .then((res) => {
          expect(res.body.downvotes).not.toContain(createdUser._id);
        });
    });
  });

  // TAG --------------------------
  describe('Tags', () => {
    it('(GET) /tags', () => {
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
