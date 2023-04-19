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

    start() :Promise<any>;
    stop() :Promise<any>;
    restart() :Promise<any>;
}

export const LabSchema = new Schema({
    _id: {type: String, required: true},
    template: {type: String, required: true},
    portPrefix: {type :String, required: true}
});

export const LabModel = mongoose.model<Lab>('Lab',LabSchema);