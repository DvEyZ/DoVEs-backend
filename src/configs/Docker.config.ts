import fs from 'node:fs';

interface IDockerConfig
{
    api :{
        socketPath: string
    } | {
        host :string,
        port :string,
        ca :Buffer,
        cert :Buffer,
        key :Buffer
    } | undefined,

    compose :'local' | {
        host :string,
        port :string,
        ca :Buffer,
        cert :Buffer,
        key :Buffer
    } | undefined,

    host: string,
}

const DockerConfig :IDockerConfig = {
    api: process.env.DOCKER_VIA === 'local' ? {
        socketPath: process.env.DOCKER_SOCKET_PATH!,
    } : 
    process.env.DOCKER_VIA === 'ssh' ? {
        host: process.env.DOCKER_SSH_HOST!,
        port: process.env.DOCKER_SSH_PORT!,
        ca: fs.readFileSync(process.env.DOCKER_SSH_CA!),
        cert: fs.readFileSync(process.env.DOCKER_SSH_CERT!),
        key: fs.readFileSync(process.env.DOCKER_SSH_KEY!)
    } : undefined,

    compose: process.env.DOCKER_VIA === 'local' ? 'local' : 
    process.env.DOCKER_VIA === 'ssh' ? {
        host: process.env.DOCKER_SSH_HOST!,
        port: process.env.DOCKER_SSH_PORT!,
        ca: fs.readFileSync(process.env.DOCKER_SSH_CA!),
        cert: fs.readFileSync(process.env.DOCKER_SSH_CERT!),
        key: fs.readFileSync(process.env.DOCKER_SSH_KEY!)
    } : undefined,

    host: process.env.DOCKER_HOST || 'localhost',
}

export default DockerConfig;