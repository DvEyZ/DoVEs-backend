# DoVEs backend

## What is DoVEs?

DoVEs - Docker Virtual Environments is a software for creating virtual environments, and seamlessly linking them to remote access providers, such as Apache Guacamole.

## Environment variables

- `MONGO_URI` - MongoDB database connection URI.
- `DOCKER_VIA` - method of Docker daemon access. Either `local` for Docker daemon on host, or `ssh` for remote access via SSH.
- `DOCKER_SOCKET_PATH` - path to Docker socket. Required if `DOCKER_VIA` is `local`.
- `DOCKER_SSH_HOST` - remote Docker host address. Required if `DOCKER_VIA` is `ssh`.
- `DOCKER_SSH_PORT` - remote Docker host SSH port, if `DOCKER_VIA` is `ssh`. Defaults to `22`.
- `DOCKER_SSH_USERNAME` - username for remote Docker host. Required if `DOCKER_VIA` is `ssh`.
- `DOCKER_SSH_KEY` - path to private key used to connect to remote Docker host. Required if `DOCKER_VIA` is `ssh`.
- `LAB_PATH` - absolute path to directory containing lab data on Docker host. Required.
- `DOCKER_COMPOSE_CREATE_SCRIPT` - script used to set up a lab. It will operate in newly created directory in `LAB_PATH`, with `docker-compose.yml` present. Usually `docker-compose up` will be enough.
- `DOCKER_COMPOSE_TEAR_DOWN_SCRIPT` - script used to tear down a lab. It will operate in lab directory in `LAB_PATH`, with `docker-compose.yml` present. Usually `docker-compose down` will be enough.
- `LP_DEFAULT_PASSWORD` - default password for newly created login provider users. Defaults to `password`.