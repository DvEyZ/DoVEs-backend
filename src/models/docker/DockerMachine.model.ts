import { Machine } from "../Machine.model";
import DockerConfig from "../../configs/Docker.config";
import { Container } from "node-docker-api/lib/container";
import { dockerComposeConnection, dockerConnection } from "../../services/Docker.service";

interface ContainerData {[key :string]: any};

export class DockerMachine implements Machine
{
    container :Container;
    name :string;
    lab :string;
    type :string;
    address: string;
    portRedirections: Array<{ inbound: number; outbound: number;  access: string | undefined }>;
    supplement: object;

    constructor(container :Container)
    {
        this.container = container;
        
        let data :ContainerData = this.container.data;

        this.name = data.Labels['com.docker.compose.service'];
        this.lab = data.Labels['com.docker.compose.project'];
        this.type = 'docker';
        this.address = DockerConfig.api?.host || 'localhost';
        let prs = data.Ports.map((v :{IP :string, PrivatePort :number, PublicPort :number, Type :string}) => {
            return {
                inbound: v.PrivatePort, 
                outbound: v.PublicPort, 
                access: v.PrivatePort === 22 ? 'ssh' : undefined
            }
        });

        this.portRedirections = [...new Set(prs.map((v :any) => JSON.stringify(v)))].map((v :any) => JSON.parse(v))

        this.supplement = {};
    }

    get status() :string
    {
        let data :ContainerData = this.container.data;
        return data.State;
    }
    
    async start() :Promise<Container>
    {
        return this.container.start();
    }

    async stop() :Promise<Container>
    {
        return this.container.stop();
    }

    async restart() :Promise<Container> 
    {
        await this.container.stop();
        await this.container.delete();
        await dockerComposeConnection().rebuildMachine(this.lab, this.name);
        let mxns = await dockerConnection().container.list({filters: {label: [
            `com.docker.compose.project=${this.lab}`,
            `com.docker.compose.service=${this.name}`
        ]}}); 
        return mxns[0];
    }

    async tearDown() :Promise<any>
    {
        return this.container.delete();
    }
}