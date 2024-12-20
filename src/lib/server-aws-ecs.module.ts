import { Module } from '@nestjs/common';
import { moduleFactory } from '@onivoro/server-common';
import { ECS } from '@aws-sdk/client-ecs';
import { EcsService } from './services/ecs.service';
import { ServerAwsEcsConfig } from './classes/server-aws-ecs-config.class';

let ecsClient: ECS | null = null;

@Module({})
export class ServerAwsEcsModule {
  static configure(config: ServerAwsEcsConfig) {
    return moduleFactory({
      module: ServerAwsEcsModule,
      providers: [
        {
          provide: ECS,
          useFactory: () => ecsClient
            ? ecsClient
            : ecsClient = new ECS({
              region: config.AWS_REGION,
              logger: console,
              credentials: config.NODE_ENV === 'production'
                ? undefined
                : {
                  accessKeyId: config.AWS_ACCESS_KEY_ID,
                  secretAccessKey: config.AWS_SECRET_ACCESS_KEY
                }
            })
        },
        { provide: ServerAwsEcsConfig, useValue: config },
        EcsService
      ],
    })
  }
}
