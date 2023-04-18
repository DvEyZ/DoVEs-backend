import { Schema } from "mongoose";
import { LabModel } from "../Lab.model";
import { Machine } from "../Machine.model";
import { dockerConnection } from "../../services/Docker.service";
import { Container } from "node-docker-api/lib/container";
import { DockerMachine } from "./DockerMachine.model";

const DockerLabSchema = new Schema({});

DockerLabSchema.methods.getMachines = async function () :Promise<Array<Machine>> {
    // Fetch all machines from the lab
    return new Promise((resolve, reject) => {
        dockerConnection.container.list({filters: {label: []}}).then((containers :Array<Container>) => {
            resolve(containers.map((c :Container) :Machine => new DockerMachine(c)));
        }).catch((e) => {reject(e);})
    })
}

DockerLabSchema.methods.getMachine = async function (name :string) :Promise<Machine> {
    // Fetch one machine from the lab 
    return new Promise((resolve, reject) => {
        dockerConnection.container.list({filters: {name: [`${this.name}_${name}`]}}).then((c :Array<Container>) => {
            if(c[0])
                resolve(new DockerMachine(c[0]));
            else
                reject();
        }).catch((e) => {reject(e);})
    })
}

DockerLabSchema.pre('save', function (next) {
    if(!this.isNew) return next();
    
    // Create Docker lab (preferably via docker-compose)

    return next();
})

DockerLabSchema.pre('deleteOne', {document:true,query:false}, function (next) {
    // Tear down Docker lab
    LabModel.findById(this._id).then((v) => {
        v!.getMachines().then((machines) => {
            Promise.all(machines.map(async (m) => m.tearDown())).then(() => {
                next();
            }).catch((e) => {next(e);})
        })
    }).catch((e) => {next(e);});
});

export const DockerLabModel = LabModel.discriminator('docker', DockerLabSchema);