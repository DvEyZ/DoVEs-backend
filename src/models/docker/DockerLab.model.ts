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
    return new Promise((resolve, reject) => {
        dockerConnection().container.list({filters: {label: [
            `com.docker.compose.project=${this.name}`
        ]}}).then((containers :Array<Container>) => {
            resolve(containers.map((c :Container) :Machine => new DockerMachine(c)));
        }).catch((e) => {reject(e);})
    })
}

DockerLabSchema.methods.getMachine = async function (name :string) :Promise<Machine> {
    // Fetch one machine from the lab 
    return new Promise((resolve, reject) => {
        dockerConnection().container.list({filters: {label: [
            `com.docker.compose.project=${this.name}`,
            `com.docker.compose.service=${name}`
        ]}}).then((c :Array<Container>) => {
            if(c[0])
                resolve(new DockerMachine(c[0]));
            else
                reject();
        }).catch((e) => {reject(e);})
    })
}

DockerLabSchema.methods.start = async function () :Promise<any> {
    let machines :Machine[] = await this.getMachines()
    await Promise.all(machines.map(async (m) => {await m.start();}))
}

DockerLabSchema.methods.stop = async function () :Promise<any> {
    let machines :Machine[] = await this.getMachines()
    await Promise.all(machines.map(async (m) => {await m.stop();}))
}

DockerLabSchema.methods.restart = async function () :Promise<any> {
    let machines :Machine[] = await this.getMachines()
    await Promise.all(machines.map(async (m) => {await m.restart();}))
}

DockerLabSchema.pre('save', async function (this :any, next) {
    if(!this.isNew) return next();
    
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
                    return `${this.portPrefix}${('0' + i).slice(-2)}${v.inbound}:${v.outbound}`
                })
            }
        }
        
        delete compose['services'][v.name];
    });

    await dockerComposeConnection().createLab(String(this.name), YAML.stringify(compose));

    return next();
})

DockerLabSchema.pre('deleteOne', {document:true,query:false}, async function (this:any, next) {
    // Tear down Docker lab
    await dockerComposeConnection().tearDownLab(String(this.name));

    return next();
});

export const DockerLabModel = LabModel.discriminator<Lab>('Lab:docker', DockerLabSchema, 'docker');