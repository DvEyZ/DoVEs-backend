import fs from 'node:fs';

require('dotenv').config();

interface IDockerConfig
{
    via: string, // either 'local' or 'ssh'

    api :{
        socketPath? :string, // path to local Docker socket, if local
        host? :string,  // host of remote Docker socket, if via ssh
        port? :string,  // ssh port of remote Docker socket, if via ssh
        user? :string,  // ssh user, if via ssh
        sshOptions? :any    // ssh key, if via ssh
    } | undefined,

    compose :{
        labPath :string,
        createScript :string,
        tearDownScript :string,
        host? :string,  // host of remote Docker socket, if via ssh
        port? :string,  // ssh port of remote Docker socket, if via ssh
        user? :string,  // ssh user, if via ssh
        key? :Buffer    // ssh key, if via ssh       
    } | undefined,

    host :string,
}

const DockerConfig :IDockerConfig = {
    via: process.env.DOCKER_VIA!,

    api: process.env.DOCKER_VIA === 'local' ? {
        socketPath: process.env.DOCKER_SOCKET_PATH,
    } : 
    process.env.DOCKER_VIA === 'ssh' ? {
        host: process.env.DOCKER_SSH_HOST,
        port: process.env.DOCKER_SSH_PORT,
        user: process.env.DOCKER_SSH_USER,
        sshOptions: {
            key: process.env.DOCKER_SSH_KEY ? fs.readFileSync(process.env.DOCKER_SSH_KEY) : undefined
        }
    } : undefined,

    compose: {
        labPath: process.env.LAB_PATH!,
        createScript: process.env.DOCKER_COMPOSE_CREATE_SCRIPT!,
        tearDownScript: process.env.DOCKER_COMPOSE_TEAR_DOWN_SCRIPT!,
        ...(process.env.DOCKER_VIA === 'local' ? {} : 
        process.env.DOCKER_VIA === 'ssh' ? {
            host: process.env.DOCKER_SSH_HOST,
            port: process.env.DOCKER_SSH_PORT,
            user: process.env.DOCKER_SSH_USER,
            key: process.env.DOCKER_SSH_KEY ? fs.readFileSync(process.env.DOCKER_SSH_KEY) : undefined
        } : {
        }),
    },

    host: process.env.DOCKER_HOST || 'localhost',
}

export default DockerConfig;