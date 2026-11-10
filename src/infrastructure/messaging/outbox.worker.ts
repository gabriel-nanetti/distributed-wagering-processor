import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { EntityManager } from '@mikro-orm/core';
import { OutboxMessageEntity } from '../entities/outbox-message.entity';

const QUEUE_URL = process.env.SQS_QUEUE_URL ?? 'http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/wager-transactions.fifo';
const BATCH_SIZE = 10;
const POLL_INTERVAL_MS = 2000;

@Injectable()
export class OutboxWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxWorker.name);
  private readonly sqs: SQSClient;
  private running = false;
  private timer: NodeJS.Timeout | null = null;

  constructor(private readonly em: EntityManager) {
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
    this.startPolling();
  }

  onModuleDestroy() {
    this.running = false;
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  private startPolling() {
    const poll = async () => {
      if (!this.running) return;

      try {
        await this.processPendingEvents();
      } catch (err) {
        this.logger.error('Error processing outbox events', err);
      } finally {
        if (this.running) {
          this.timer = setTimeout(poll, POLL_INTERVAL_MS);
        }
      }
    };

    poll();
  }

  private async processPendingEvents() {
    const fork = this.em.fork();
    const now = new Date();

    // Tipagem explícita para o MikroORM reconhecer as propriedades da entidade
    const pendingMessages = await fork.find(
      OutboxMessageEntity,
      {
        publishedAt: undefined,
        $or: [
          { nextAttemptAt: undefined },
          { nextAttemptAt: { $lte: now } },
        ],
      },
      {
        limit: BATCH_SIZE,
        orderBy: { occurredAt: 'asc' as const },
      },
    );

    for (const message of pendingMessages) {
      try {
        await this.sqs.send(
          new SendMessageCommand({
            QueueUrl: QUEUE_URL,
            MessageBody: JSON.stringify({
              messageId: message.id,
              type: message.eventType,
              occurredAt: message.occurredAt.toISOString(),
              data: message.payload,
            }),
            MessageGroupId: message.aggregateId,
            MessageDeduplicationId: message.id,
          }),
        );

        await fork.nativeUpdate(
          OutboxMessageEntity,
          { id: message.id, publishedAt: undefined },
          { publishedAt: new Date() },
        );
      } catch (err) {
        this.logger.error(`Failed to publish outbox event ${message.id}`, err);
        
        const attempts = message.attempts + 1;
        const nextAttemptAt = new Date(now.getTime() + Math.pow(2, attempts) * 1000);

        await fork.nativeUpdate(
          OutboxMessageEntity,
          { id: message.id },
          { attempts, nextAttemptAt },
        );
      }
    }
  }
}