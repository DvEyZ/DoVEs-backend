import mongoose, { Schema } from "mongoose";
import { Lab, LabModel } from "../Lab.model";
import { Machine } from "../Machine.model";
import { dockerConnection, dockerComposeConnection } from "../../services/Docker.service";
import { Container } from "node-docker-api/lib/container";
import { DockerMachine } from "./DockerMachine.model";
import YAML from 'yaml';
import { ApiError } from "../../utils/ApiError";
import { TemplateModel } from "../Template.model";

const DockerLabSchema = new Schema({});

DockerLabSchema.methods.getMachines = async function () :Promise<Array<Machine>> {
    // Fetch all machines from the lab

    let containers = await dockerConnection().container.list({all:true, filters: {label: [
        `com.docker.compose.project=${this.name}`
    ]}});

    return containers.map((c :Container) :Machine => new DockerMachine(c));
}

DockerLabSchema.methods.getMachine = async function (name :string) :Promise<Machine> {
    // Fetch one machine from the lab 
    let c = await dockerConnection().container.list({all:true, filters: {label: [
        `com.docker.compose.project=${this.name}`,
        `com.docker.compose.service=${name}`
    ]}})

    if(c[0])
        return new DockerMachine(c[0]);
    else
        throw new ApiError(404, 'Machine not found');
}

DockerLabSchema.methods.start = async function (this :Lab) :Promise<any> {
    let machines :Machine[] = await this.getMachines()
    await Promise.all(machines.map(async (m) => {await m.start();}))
}

DockerLabSchema.methods.stop = async function (this :Lab) :Promise<any> {
    let machines :Machine[] = await this.getMachines()
    await Promise.all(machines.map(async (m) => {await m.stop();}))
}

DockerLabSchema.methods.restart = async function (this :Lab) :Promise<any> {
    await dockerComposeConnection().rebuildLab(this.name);
}

DockerLabSchema.methods.labUp = async function (this :Lab) :Promise<any> {    
    let template = await TemplateModel.findById(this.template);

    if(!template || template.type !== 'docker')
        throw new ApiError(400, 'Invalid template.')

    let compose = YAML.parse(template.supplement.base);
    
    template.machineDefs.forEach((v :{
        name :string;
        ports :{inbound :number, outbound :number}[];
        supplement :any;
    }) => {
        let machine = compose['services'][v.name];

        for(let i = 0; i < this.machineCount; i++)
        {
            if(i > 99) throw new ApiError(422, 'Number out of range.');

            compose['services'][`${v.name}_${i}`] = {
                ...machine,
                ports: v.ports.map((v) => {
                    return `${this.portPrefix}${('0' + i).slice(-2)}${v.outbound}:${v.inbound}`
                })
            }
        }
        
        delete compose['services'][v.name];
    });

    await dockerComposeConnection().createLab(String(this.name), YAML.stringify(compose, {defaultKeyType:'PLAIN', defaultStringType:'QUOTE_SINGLE'}));
}

DockerLabSchema.methods.labDown = async function () {
    await dockerComposeConnection().tearDownLab(this.name);
}

export const DockerLabModel = LabModel.discriminator<Lab>('Lab:docker', DockerLabSchema, 'docker');