import fs from 'node:fs';

require('dotenv').config();

interface IDockerConfig
{
    via: string, // either 'local' or 'ssh'

    api :{
        protocol? :string,
        socketPath? :string, // path to local Docker socket, if local
        host? :string,  // host of remote Docker socket, if via ssh
        port? :number,  // ssh port of remote Docker socket, if via ssh
        username? :string,  // ssh user, if via ssh
        sshOptions? :{privateKey? :Buffer}    // ssh key, if via ssh
    } | undefined,

    compose :{
        labPath :string,
        createScript :string,
        tearDownScript :string,
        rebuildMachineScript :string,
        host? :string,  // host of remote Docker socket, if via ssh
        port? :number,  // ssh port of remote Docker socket, if via ssh
        user? :string,  // ssh user, if via ssh
        key? :Buffer    // ssh key, if via ssh       
    } | undefined,
}

const DockerConfig :IDockerConfig = {
    via: process.env.DOCKER_VIA!,

    api: process.env.DOCKER_VIA === 'local' ? {
        socketPath: process.env.DOCKER_SOCKET_PATH,
    } : 
    process.env.DOCKER_VIA === 'ssh' ? {
        protocol: 'ssh',
        host: process.env.DOCKER_SSH_HOST,
        port: Number(process.env.DOCKER_SSH_PORT) || 22,
        username: process.env.DOCKER_SSH_USER,
        sshOptions: {
            privateKey: process.env.DOCKER_SSH_KEY ? fs.readFileSync(process.env.DOCKER_SSH_KEY) : undefined
        }
    } : undefined,

    compose: {
        labPath: process.env.LAB_PATH!,
        createScript: process.env.DOCKER_COMPOSE_CREATE_SCRIPT!,
        tearDownScript: process.env.DOCKER_COMPOSE_TEAR_DOWN_SCRIPT!,
        rebuildMachineScript: process.env.DOCKER_COMPOSE_REBUILD_MACHINE_SCRIPT!,
        ...(process.env.DOCKER_VIA === 'local' ? {} : 
        process.env.DOCKER_VIA === 'ssh' ? {
            host: process.env.DOCKER_SSH_HOST,
            port: Number(process.env.DOCKER_SSH_PORT) || 22,
            user: process.env.DOCKER_SSH_USER,
            key: process.env.DOCKER_SSH_KEY ? fs.readFileSync(process.env.DOCKER_SSH_KEY) : undefined
        } : {
        }),
    },
}

export default DockerConfig;