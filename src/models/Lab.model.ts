import mongoose, { Document, Mongoose, Schema } from "mongoose";
import { Machine } from "./Machine.model";
import { LoginProvider } from "./LoginProviders/LoginProvider.model";

export interface Lab
{
    _id :string;
    type :string;
    template :string;
    portPrefix :number;
    machineCount :number;
    loginProviders :[LoginProvider];

    getMachines() :Promise<Array<Machine>>;
    getMachine(name :string) :Promise<Machine>;

    start() :Promise<any>;
    stop() :Promise<any>;
    restart() :Promise<any>;
}

export const LabSchema = new Schema({
    _id: {type: String, required: true},
    template: {type: String, required: true},
    portPrefix: {type :Number, required: true, min: 1, max: 5},
    machineCount: {type: Number, required: true},
    loginProviders: {type: [{type: Schema.Types.ObjectId, ref: 'LoginProvider'}], required: true}
}, {discriminatorKey: 'type'});

LabSchema.post('save', async function (doc, next) {
    if(!this.isNew) return next();

    // Init login providers
    let d = await LabModel.findById(doc._id).populate('loginProviders');
    let machines = await d!.getMachines();

    d!.loginProviders.forEach(async (provider) => {
        provider.createEnvironment(d!._id);
        machines.forEach((m) => {
            provider.createConnection(m.name, m.address, m.portRedirections.filter((v) => {
                return !!v.access;
            })[0].outbound);
        });
    });
});

export const LabModel = mongoose.model<Lab>('Lab',LabSchema);