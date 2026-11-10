"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SqsConsumer_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqsConsumer = void 0;
const common_1 = require("@nestjs/common");
const client_sqs_1 = require("@aws-sdk/client-sqs");
const core_1 = require("@mikro-orm/core");
const process_wager_transaction_use_case_1 = require("../../application/use-cases/process-wager-transaction.use-case");
const inbox_message_entity_1 = require("../entities/inbox-message.entity");
const crypto = __importStar(require("crypto"));
const QUEUE_URL = process.env.SQS_QUEUE_URL ?? 'http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/wager-transactions.fifo';
const MAX_ATTEMPTS = 5;
const CONSUMER_NAME = 'wager-processor';
let SqsConsumer = SqsConsumer_1 = class SqsConsumer {
    em;
    useCase;
    logger = new common_1.Logger(SqsConsumer_1.name);
    sqs;
    running = false;
    constructor(em, useCase) {
        this.em = em;
        this.useCase = useCase;
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
        this.poll();
    }
    onModuleDestroy() {
        this.running = false;
    }
    async poll() {
        while (this.running) {
            try {
                const result = await this.sqs.send(new client_sqs_1.ReceiveMessageCommand({
                    QueueUrl: QUEUE_URL,
                    MaxNumberOfMessages: 10,
                    WaitTimeSeconds: 20,
                    MessageAttributeNames: ['All'],
                }));
                for (const message of result.Messages ?? []) {
                    await this.processMessage(message);
                }
            }
            catch (err) {
                this.logger.error('SQS poll error', err);
                await this.sleep(5000);
            }
        }
    }
    async processMessage(message) {
        let body;
        try {
            body = JSON.parse(message.Body);
        }
        catch (err) {
            this.logger.error(`Failed to parse SQS message body`, err);
            await this.ack(message.ReceiptHandle);
            return;
        }
        const messageId = body.messageId ?? message.MessageId;
        const data = body.data;
        try {
            const fork = this.em.fork();
            const alreadyProcessed = await fork.findOne(inbox_message_entity_1.InboxMessageEntity, {
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
                const inbox = em.create(inbox_message_entity_1.InboxMessageEntity, {
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
        }
        catch (err) {
            this.logger.error(`Failed to process message ${messageId}: ${err.message}`);
            const attempts = Number(message.Attributes?.ApproximateReceiveCount ?? 1);
            if (attempts >= MAX_ATTEMPTS) {
                this.logger.error(`Message ${messageId} exceeded max attempts`);
                await this.ack(message.ReceiptHandle);
            }
        }
    }
    async ack(receiptHandle) {
        await this.sqs.send(new client_sqs_1.DeleteMessageCommand({
            QueueUrl: QUEUE_URL,
            ReceiptHandle: receiptHandle,
        }));
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};
exports.SqsConsumer = SqsConsumer;
exports.SqsConsumer = SqsConsumer = SqsConsumer_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.EntityManager,
        process_wager_transaction_use_case_1.ProcessWagerTransactionUseCase])
], SqsConsumer);
//# sourceMappingURL=sqs.consumer.js.map