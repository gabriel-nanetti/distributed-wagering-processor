"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OutboxWorker_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutboxWorker = void 0;
const common_1 = require("@nestjs/common");
const client_sqs_1 = require("@aws-sdk/client-sqs");
const core_1 = require("@mikro-orm/core");
const outbox_message_entity_1 = require("../entities/outbox-message.entity");
const QUEUE_URL = process.env.SQS_QUEUE_URL ?? 'http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/wager-transactions.fifo';
const BATCH_SIZE = 10;
const POLL_INTERVAL_MS = 2000;
let OutboxWorker = OutboxWorker_1 = class OutboxWorker {
    em;
    logger = new common_1.Logger(OutboxWorker_1.name);
    sqs;
    running = false;
    timer = null;
    constructor(em) {
        this.em = em;
        this.sqs = new client_sqs_1.SQSClient({
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
    startPolling() {
        const poll = async () => {
            if (!this.running)
                return;
            try {
                await this.processPendingEvents();
            }
            catch (err) {
                this.logger.error('Error processing outbox events', err);
            }
            finally {
                if (this.running) {
                    this.timer = setTimeout(poll, POLL_INTERVAL_MS);
                }
            }
        };
        poll();
    }
    async processPendingEvents() {
        const fork = this.em.fork();
        const now = new Date();
        const pendingMessages = await fork.find(outbox_message_entity_1.OutboxMessageEntity, {
            publishedAt: undefined,
            $or: [
                { nextAttemptAt: undefined },
                { nextAttemptAt: { $lte: now } },
            ],
        }, {
            limit: BATCH_SIZE,
            orderBy: { occurredAt: 'asc' },
        });
        for (const message of pendingMessages) {
            try {
                await this.sqs.send(new client_sqs_1.SendMessageCommand({
                    QueueUrl: QUEUE_URL,
                    MessageBody: JSON.stringify({
                        messageId: message.id,
                        type: message.eventType,
                        occurredAt: message.occurredAt.toISOString(),
                        data: message.payload,
                    }),
                    MessageGroupId: message.aggregateId,
                    MessageDeduplicationId: message.id,
                }));
                await fork.nativeUpdate(outbox_message_entity_1.OutboxMessageEntity, { id: message.id, publishedAt: undefined }, { publishedAt: new Date() });
            }
            catch (err) {
                this.logger.error(`Failed to publish outbox event ${message.id}`, err);
                const attempts = message.attempts + 1;
                const nextAttemptAt = new Date(now.getTime() + Math.pow(2, attempts) * 1000);
                await fork.nativeUpdate(outbox_message_entity_1.OutboxMessageEntity, { id: message.id }, { attempts, nextAttemptAt });
            }
        }
    }
};
exports.OutboxWorker = OutboxWorker;
exports.OutboxWorker = OutboxWorker = OutboxWorker_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.EntityManager])
], OutboxWorker);
//# sourceMappingURL=outbox.worker.js.map