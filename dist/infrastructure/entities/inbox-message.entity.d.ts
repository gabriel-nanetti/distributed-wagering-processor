export declare class InboxMessageEntity {
    id: string;
    messageId: string;
    consumerName: string;
    payloadHash: string;
    receivedAt: Date;
    processedAt?: Date;
}
