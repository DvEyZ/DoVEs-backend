import { Docker } from 'node-docker-api';
import DockerConfig from "../configs/Docker.config";
import { NodeSSH } from 'node-ssh';
import fs from 'node:fs';
import { exec } from 'node:child_process';

export const dockerConnection = () => new Docker(DockerConfig.api);

interface IDockerComposeConnection
{
    createLab(name :string, compose :string) :Promise<any>;
    tearDownLab(name :string) :Promise<any>;
}

class DockerComposeLocalConnection implements IDockerComposeConnection
{
    constructor(private options :any)
    {}

    async createLab(name: string, compose: string) :Promise<any> 
    {
        return new Promise((resolve, reject) => {
            // Write compose
            fs.mkdirSync(`${this.options.labPath}/${name}`);
            fs.writeFileSync(`${this.options.labPath}/${name}/docker-compose.yml`, Buffer.from(compose));
            // Create lab
            exec(`${this.options.createScript}`, {cwd: `${this.options.labPath}/${name}`}, (error, stdout, stderr) => {
                if(error) reject(error);
                resolve(`${name}`);
            })
        })
    }

    async tearDownLab(name: string) :Promise<any> 
    {
        return new Promise((resolve, reject) => {
            exec(`${this.options.tearDownScript}`, {cwd: `${this.options.labPath}/${name}`}, (error, stdout, stderr) => {
                if(error) reject(error);

                fs.rmdirSync(`${this.options.labPath}/${name}`);
                resolve(`${name}`)
            })
        })
    }
}

class DockerComposeSSHConnection implements IDockerComposeConnection
{
    constructor(private options :any)
    {
        if(!(
            !!('host' in options && options.host) && 
            !!('port' in options && options.port) &&
            !!('user' in options && options.user) && 
            !!('key' in options && options.key)
        )) throw new Error('Missing config properties. Check your environment variables.');
    }

    async createLab(name: string, compose: string) :Promise<any> 
    {
        return new Promise((resolve, reject) => {
            const ssh = new NodeSSH();
            ssh.connect({
                host: this.options.host,
                port: this.options.port,
                username: this.options.user,
                privateKey: this.options.key.toString()
            }).then(() => {
                ssh.mkdir(`${this.options.labPath}/${name}`).then(() => {
                    ssh.exec('tee', [`docker-compose.yml`], {cwd: `${this.options.labPath}/${name}`, stdin: compose}).then(() => {
                        ssh.execCommand(`${this.options.createScript}`, {cwd: `${this.options.labPath}/${name}`}).then((result) => {
                            if(result.code !== 0) reject(result.stderr);
                            resolve(`${name}`);
                        });
                    })
                });
            });
        });
    }

    async tearDownLab(name: string) :Promise<any> 
    {
        return new Promise((resolve, reject) => {
            const ssh = new NodeSSH();
            ssh.connect({
                host: this.options.host,
                port: this.options.port,
                username: this.options.user,
                privateKey: this.options.key.toString()
            }).then(() => {
                ssh.execCommand(`${this.options.tearDownScript}`, {cwd: `${this.options.labPath}/${name}`}).then((result) => {
                    if(result.code !== 0) reject(result.stderr);
                    ssh.execCommand(`rmdir ${this.options.labPath}/${name}`).then((result) => {
                        if(result.code !== 0) reject(result.stderr);
                        resolve(`${name}`);
                    })
                })
            });
        });
    }
}

const DockerComposeConnectionFactory = (type :string, options :any) :IDockerComposeConnection =>
{
    if(!(
        !!('labPath' in options && options.labPath) &&
        !!('createScript' in options && options.createScript) &&
        !!('tearDownScript' in options && options.tearDownScript)
    )) throw new Error('Missing config properties. Check your environment variables.');

    if(type === 'local') return new DockerComposeLocalConnection(options);
    if(type === 'ssh') return new DockerComposeSSHConnection(options);

    throw new Error('Invalid Docker connection type.')
}

export const dockerComposeConnection = () => DockerComposeConnectionFactory(DockerConfig.via, DockerConfig.compose);
    