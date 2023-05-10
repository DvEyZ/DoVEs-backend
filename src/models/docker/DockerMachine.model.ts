import { Machine } from "../Machine.model";
import DockerConfig from "../../configs/Docker.config";
import { Container } from "node-docker-api/lib/container";

interface ContainerData {[key :string]: any};

export class DockerMachine implements Machine
{
    container :Container;
    name :string;
    type :string;
    address: string;
    portRedirections: Array<{ inbound: number; outbound: number;  access: string | undefined }>;
    supplement: object;

    constructor(container :Container)
    {
        this.container = container;
        
        let data :ContainerData = this.container.data;

        this.name = data.Labels['com.docker.compose.service']
        this.type = 'docker';
        this.address = DockerConfig.api?.host || 'localhost';
        this.portRedirections = [...new Set<{ inbound: number; outbound: number; access: string | undefined }>(
            data.Ports.map((v :{IP :string, PrivatePort :number, PublicPort :number, Type :string}) => {
                return {
                    inbound: v.PrivatePort, 
                    outbound: v.PublicPort, 
                    access: v.PrivatePort === 22 ? 'ssh' : undefined
                }
            })
        )];

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
        return this.container.restart();
    }

    async tearDown() :Promise<any>
    {
        return this.container.delete();
    }
}