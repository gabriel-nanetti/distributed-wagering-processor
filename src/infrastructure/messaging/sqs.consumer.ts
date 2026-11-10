import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { EntityManager } from '@mikro-orm/core';
import { ProcessWagerTransactionUseCase } from '../../application/use-cases/process-wager-transaction.use-case';
import { InboxMessageEntity } from '../entities/inbox-message.entity';
import * as crypto from 'crypto';

const QUEUE_URL = process.env.SQS_QUEUE_URL ?? 'http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/wager-transactions.fifo';
const MAX_ATTEMPTS = 5;
const CONSUMER_NAME = 'wager-processor';

@Injectable()
export class SqsConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SqsConsumer.name);
  private readonly sqs: SQSClient;
  private running = false;

  constructor(
    private readonly em: EntityManager,
    private readonly useCase: ProcessWagerTransactionUseCase,
  ) {
    this.sqs = new SQSClient({
      region: process.env.AWS_REGION ?? 'us-east-1',
      endpoint: process.env.AWS_ENDPOINT ?? 'http://localhost:4566',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? 'test',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? 'test',
      },
    });
  }

  onModuleInit() {
    this.running = true;
    this.poll();
  }

  onModuleDestroy() {
    this.running = false;
  }

  private async poll() {
    while (this.running) {
      try {
        const result = await this.sqs.send(new ReceiveMessageCommand({
          QueueUrl: QUEUE_URL,
          MaxNumberOfMessages: 10,
          WaitTimeSeconds: 20,
          MessageAttributeNames: ['All'],
        }));

        for (const message of result.Messages ?? []) {
          await this.processMessage(message);
        }
      } catch (err) {
        this.logger.error('SQS poll error', err);
        await this.sleep(5000);
      }
    }
  }

  private async processMessage(message: any) {
    let body: any;
    try {
      body = JSON.parse(message.Body);
    } catch (err) {
      this.logger.error(`Failed to parse SQS message body`, err);
      await this.ack(message.ReceiptHandle);
      return;
    }

    const messageId = body.messageId ?? message.MessageId;
    const data = body.data;

    try {
      const fork = this.em.fork();

      const alreadyProcessed = await fork.findOne(InboxMessageEntity, {
        consumerName: CONSUMER_NAME,
        messageId,
      });

      if (alreadyProcessed?.processedAt) {
        this.logger.log(`Message ${messageId} already processed, acking`);
        await this.ack(message.ReceiptHandle);
        return;
      }

      const payloadHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(data, Object.keys(data).sort()))
        .digest('hex');

      await fork.transactional(async (em) => {
        const inbox = em.create(InboxMessageEntity, {
          id: crypto.randomUUID(),
          messageId,
          consumerName: CONSUMER_NAME,
          payloadHash,
          receivedAt: new Date(),
          processedAt: new Date(),
        });
        em.persist(inbox);
      });

      this.logger.log(`Processing transaction ${data.idempotencyKey}`);
      await this.useCase.execute({
        ...data,
        payloadHash,
        correlationId: messageId,
      });
      this.logger.log(`Transaction ${data.idempotencyKey} processed successfully`);

      await this.ack(message.ReceiptHandle);
    } catch (err: any) {
      this.logger.error(`Failed to process message ${messageId}: ${err.message}`);
      const attempts = Number(message.Attributes?.ApproximateReceiveCount ?? 1);
      if (attempts >= MAX_ATTEMPTS) {
        this.logger.error(`Message ${messageId} exceeded max attempts`);
        await this.ack(message.ReceiptHandle);
      }
    }
  }

  private async ack(receiptHandle: string) {
    await this.sqs.send(new DeleteMessageCommand({
      QueueUrl: QUEUE_URL,
      ReceiptHandle: receiptHandle,
    }));
  }

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}