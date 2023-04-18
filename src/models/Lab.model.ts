import mongoose, { Document, Schema } from "mongoose";
import { Machine } from "./Machine.model";

export interface Lab extends Document
{
    _id :string;
    __t :string;
    template :string;
    portPrefix :string;
    machineCount :number;

    getMachines() :Promise<Array<Machine>>;
    getMachine(name :string) :Promise<Machine>;
}

export const LabSchema = new Schema({
    _id: {type: String},
    template: {type: String},
    portPrefix: {type :String}
});

export const LabModel = mongoose.model<Lab>('Lab',LabSchema);