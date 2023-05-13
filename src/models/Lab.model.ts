import mongoose, { Document, Mongoose, Schema } from "mongoose";
import { Machine } from "./Machine.model";
import { LoginProvider, LoginProviderModel } from "./LoginProviders/LoginProvider.model";
import { Template } from "./Template.model";

export interface Lab
{
    name :string;
    type :string;
    template :Template;
    portPrefix :number;
    machineCount :number;
    loginProviders :LoginProvider[];

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

LabSchema.post('save', async function (doc, next) {
    if(!this.isNew) next();

    // Init login providers
    let lab = await LabModel.findById(doc._id).populate('template').populate('loginProviders');
    if(!lab)
        return next(new Error('This should not happen.'));
    let machines = await lab.getMachines();

    lab.loginProviders.forEach(async (provider) => {
        provider.createEnvironment(lab!.name, {});

        machines.forEach((m) => {
            m.portRedirections.filter((v) => {
                return !!v.access;
            }).forEach((port) => {
                provider.createConnection(m.name, lab!.name, m.address, port.outbound, {
                    protocol: port.access
                });
            })
        });
    });
});

export const LabModel = mongoose.model<Lab>('Lab',LabSchema);