const DockerConfig = {
    socketPath: process.env.DOCKER_SOCKET_PATH || '/var/run/docker.sock',
    host: process.env.DOCKER_HOST || 'localhost',
    labelPrefix: 'dev.kvireg.doves'
}

export default DockerConfig;