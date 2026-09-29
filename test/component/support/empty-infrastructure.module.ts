import { Module } from '@nestjs/common';

/**
 * Replaces InfrastructureModule in component tests so TypeOrmModule.forRootAsync
 * is never registered and no database connection is opened.
 */
@Module({})
export class EmptyInfrastructureModule {}
