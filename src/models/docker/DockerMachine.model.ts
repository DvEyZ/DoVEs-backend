import { Machine } from "../Machine.model";
import { dockerConnection } from "../../services/Docker.service";
import DockerConfig from "../../configs/Docker.config";
import { Container } from "node-docker-api/lib/container";

interface ContainerData {[key :string]: any};

export class DockerMachine implements Machine
{
    container :Container;
    name :string;
    type :string;
    address: string;
    portRedirections: Array<{ inbound: string; outbound: string; }>;
    supplement: object;

    constructor(container :Container)
    {
        this.container = container;
        
        let data :ContainerData = this.container.data;

        this.name = data.Labels['com.docker.compose.service']
        this.type = 'docker';
        this.address = DockerConfig.host;
        this.portRedirections = [...new Set<{ inbound: string; outbound: string; }>(
            data.Ports.map((v :{IP :string, PrivatePort :number, PublicPort :number, Type :string}) => {
                return {inbound :new String(v.PrivatePort), outbound :new String(v.PublicPort)}
            })
        )];

        this.supplement = {};
    }

    get status() :string
    {
        let data :ContainerData = this.container.data;
        return data.State;
    }
    
    async start() :Promise<any>
    {
        return this.container.start();
    }

    async stop() :Promise<any>
    {
        return this.container.stop();
    }

    async restart() :Promise<any> 
    {
        return this.container.restart();
    }

    async tearDown() :Promise<any>
    {
        return this.container.delete();
    }
}