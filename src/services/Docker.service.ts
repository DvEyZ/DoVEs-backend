import { Docker } from 'node-docker-api';
import DockerConfig from "../configs/Docker.config";

export const dockerConnection = new Docker({socketPath: DockerConfig.socketPath});