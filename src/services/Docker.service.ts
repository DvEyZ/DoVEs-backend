import { Docker } from 'node-docker-api';
import DockerConfig from "../configs/Docker.config";
import { NodeSSH } from 'node-ssh';
import fs from 'node:fs';
import { exec } from 'node:child_process';
import { ApiError } from '../utils/ApiError';

export const dockerConnection = () => new Docker(DockerConfig.api);

interface IDockerComposeConnection
{
    createLab(name :string, compose :string) :Promise<any>;
    tearDownLab(name :string) :Promise<any>;
    rebuildLab(name :string) :Promise<any>;
    rebuildMachine(name :string, lab :string) :Promise<any>;
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
            });
        })
    }

    async tearDownLab(name: string) :Promise<any> 
    {
        return new Promise((resolve, reject) => {
            exec(`${this.options.tearDownScript}`, {cwd: `${this.options.labPath}/${name}`}, (error, stdout, stderr) => {
                if(error) reject(error);

                fs.rmdirSync(`${this.options.labPath}/${name}`, {recursive: true});
                resolve(`${name}`)
            })
        })
    }

    async rebuildLab(name: string): Promise<any> {
        return new Promise((resolve, reject) => {
            exec(`${this.options.createScript}`, {cwd: `${this.options.labPath}/${name}`}, (error, stdout, stderr) => {
                if(error) reject(error);
            });

            exec(`${this.options.tearDownScript}`, {cwd: `${this.options.labPath}/${name}`}, (error, stdout, stderr) => {
                if(error) reject(error);
                resolve(`${name}`)
            });
        })
    }

    async rebuildMachine(name: string, lab: string): Promise<any> {
        return new Promise((resolve, reject) => {
            exec(`${this.options.rebuildMachineScript}`, {cwd: `${this.options.labPath}/${lab}`}, (error, stdout, stderr) => {
                if(error) reject(error);
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

    async #connect() :Promise<NodeSSH>
    {
        const ssh = new NodeSSH();
        await ssh.connect({
            host: this.options.host,
            port: this.options.port,
            username: this.options.user,
            privateKey: this.options.key.toString()
        });
        return ssh;
    }

    async createLab(name: string, compose: string) :Promise<any> 
    {
        try
        {
            const ssh = await this.#connect();

            await ssh.mkdir(`${this.options.labPath}/${name}`)
            await ssh.exec('tee', [`docker-compose.yml`], {cwd: `${this.options.labPath}/${name}`, stdin: compose})
            let result = await ssh.execCommand(`${this.options.createScript}`, {cwd: `${this.options.labPath}/${name}`})
            
            if(result.code !== 0) throw new Error(`Creation script failed: ${result.stderr}`);
        }
        catch(e)
        {
            let message = 'Unknown error';
            if(e instanceof Error) message = e.message
            throw new ApiError(500, `Error connecting to Docker host: ${message}`);
        }
    }

    async tearDownLab(name: string) :Promise<any> 
    {
        try
        {
            const ssh = await this.#connect();
            
            let result = await ssh.execCommand(`${this.options.tearDownScript}`, {cwd: `${this.options.labPath}/${name}`})
            if(result.code !== 0) throw new Error(`Deletion script failed: ${result.stderr}`);
            
            let res = await ssh.execCommand(`rm -rf ${this.options.labPath}/${name}`)
            if(res.code !== 0) throw new Error(`Directory deletion failed: ${result.stderr}`);      
        }
        catch(e)
        {
            let message = 'Unknown error';
            if(e instanceof Error) message = e.message
            throw new ApiError(500, `Error connecting to Docker host: ${message}`);
        }
    }

    async rebuildLab(name :string) :Promise<any>
    {
        try
        {
            const ssh = await this.#connect();

            let res1 = await ssh.execCommand(`${this.options.tearDownScript}`, {cwd: `${this.options.labPath}/${name}`});
            if(res1.code !== 0) throw new Error(`Rebuild failed: ${res1.stderr}`);

            let res2 = await ssh.execCommand(`${this.options.createScript}`, {cwd: `${this.options.labPath}/${name}`});
            if(res2.code !== 0) throw new Error(`Rebuild failed: ${res2.stderr}`);
        }
        catch(e)
        {
            let message = 'Unknown error';
            if(e instanceof Error) message = e.message
            throw new ApiError(500, `Error connecting to Docker host: ${message}`);
        }
    }

    async rebuildMachine(lab :string, name :string) :Promise<any>
    {
        try
        {
            const ssh = await this.#connect();

            let res = await ssh.execCommand(`${this.options.rebuildMachineScript} ${name}`, {cwd: `${this.options.labPath}/${lab}`});
            if(res.code !== 0) throw new Error(`Rebuild failed: ${res.stderr}`);
        }
        catch(e)
        {
            let message = 'Unknown error';
            if(e instanceof Error) message = e.message
            throw new ApiError(500, `Error connecting to Docker host: ${message}`);
        }
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
    