import { Schema } from "mongoose";
import { Lab, LabModel } from "../Lab.model";
import { Machine } from "../Machine.model";
import { dockerConnection, dockerComposeConnection } from "../../services/Docker.service";
import { Container } from "node-docker-api/lib/container";
import { DockerMachine } from "./DockerMachine.model";
import YAML from 'yaml';
import { MachineDefinition } from "../Template.model";

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

DockerLabSchema.pre('save', function (this :any, next) {
    if(!this.isNew) return next();
    
    let compose = YAML.parse(this.template.compose);
    
    this.template.machineDefs.forEach((v :MachineDefinition) => {
        let machine = compose[v.name];
        delete compose[v.name];

        for(let i = 0; i < this.machineCount; i++)
        {
            if(i > 99) throw new Error('Number out of range.');

            compose[`${v.name}_${i}`] = {
                ...machine,
                ports: v.ports.map((v) => {
                    return `${this.portPrefix}${i}${v.inbound}:${v.outbound}`
                })
            }
        }
    });

    dockerComposeConnection().createLab(String(this._id), YAML.stringify(compose));

    return next();
})

DockerLabSchema.pre('deleteOne', {document:true,query:false}, function (next) {
    // Tear down Docker lab
    dockerComposeConnection().tearDownLab(String(this._id));
});

export const DockerLabModel = LabModel.discriminator<Lab>('docker', DockerLabSchema);