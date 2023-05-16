import mongoose, { Document, Mongoose, Schema } from "mongoose";
import { Machine } from "./Machine.model";
import { LoginProvider, LoginProviderModel } from "./LoginProviders/LoginProvider.model";
import { Template, TemplateModel } from "./Template.model";
import DockerConfig from "../configs/Docker.config";

export interface Lab
{
    name :string;
    type :string;
    template :Template;
    portPrefix :number;
    machineCount :number;
    loginProviders :LoginProvider[];

    labUp() :Promise<any>;
    labDown() :Promise<any>;

    loginProvidersInit() :Promise<any>;
    loginProvidersDown() :Promise<any>;

    getMachines() :Promise<Machine[]>;
    getMachine(name :string) :Promise<Machine>;

    start() :Promise<any>;
    stop() :Promise<any>;
    restart() :Promise<any>;
}

export const LabSchema = new Schema({
    name: {type: String, required: true, unique: true},
    template: {type: Schema.Types.ObjectId, ref: 'Template', required: true},
    portPrefix: {type :Number, required: true, min: 1, max: 5},
    machineCount: {type: Number, required: true},
    loginProviders: {type: [Schema.Types.ObjectId], ref: 'LoginProvider', required: true}
}, {discriminatorKey: 'type'});

LabSchema.methods.loginProvidersInit = async function (this :any) {
    // Init login providers
    
    let loginProviders = await Promise.all(this.loginProviders.map(async (v :any) => 
        await LoginProviderModel.findById(v)
    ));

    loginProviders.forEach(async (provider) => {
        await provider.createEnvironment(this.name, {});
        
        let template = await TemplateModel.findById(this.template);
        if(!template)
            throw new Error('This should not happen.');

        let address = DockerConfig.api?.host || 'localhost';

        for(let i = 0; i < this.machineCount; i++)
        {
            let ap = template.machineDefs.filter((v) => {
                return !!v.ports.filter((v) => v.inbound === 22)
            })[0].ports.filter((v) => v.inbound === 22)[0];

            if(ap)
                await provider.createConnection(
                    `${this.name}-${('0'+i).slice(-2)}`, 
                    this.name, 
                    address, 
                    Number(`${this.portPrefix}${('0' + i).slice(-2)}${ap.outbound}`), 
                    {protocol: 'ssh'}
                );
        }
    });
};

LabSchema.methods.loginProvidersDown = async function () {
    let loginProviders = await Promise.all(this.loginProviders.map(async (v :any) => 
        await LoginProviderModel.findById(v)
    ));

    loginProviders.forEach(async (provider) => {
        await provider.tearDownEnvironment(this.name);
        for(let i = 0; i < this.machineCount; i++)
        {
            await provider.tearDownConnection(`${this.name}-${('0'+i).slice(-2)}`);
        }
    })
}

export const LabModel = mongoose.model<Lab>('Lab',LabSchema);