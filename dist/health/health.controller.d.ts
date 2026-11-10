import { EntityManager } from '@mikro-orm/core';
export declare class HealthController {
    private readonly em;
    constructor(em: EntityManager);
    live(): {
        status: string;
    };
    ready(): Promise<{
        status: string;
        postgres: string;
    }>;
}
