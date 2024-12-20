import { Injectable } from "@nestjs/common";
import { ECS, RunTaskCommand, RunTaskCommandInput, RunTaskCommandOutput } from '@aws-sdk/client-ecs';
import { parseCsvString } from "../functions/parse-csv-string.function";

@Injectable()
export class EcsService {

  constructor(private ecsClient: ECS) { }

  runTasks(_: { taskDefinition: string, subnets: string, securityGroups: string, taskCount: number, cluster: string }): Promise<Array<RunTaskCommandOutput>> {
    const { taskDefinition, subnets, securityGroups, taskCount, cluster } = _;
    try {
      const params: RunTaskCommandInput = {
        cluster,
        taskDefinition,
        launchType: 'FARGATE',
        networkConfiguration: {
          awsvpcConfiguration: {
            assignPublicIp: 'DISABLED',
            subnets: parseCsvString(subnets),
            securityGroups: parseCsvString(securityGroups),
          }
        },
      };

      const taskPromises = new Array(taskCount)
        .fill(undefined)
        .map(() => this.ecsClient.send(new RunTaskCommand(params)));

      return Promise.all(taskPromises);
    } catch (error) {
      console.error('Failed to run ECS task:', error);
      throw error;
    }
  }
}
