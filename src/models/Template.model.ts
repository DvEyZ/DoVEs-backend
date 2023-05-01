import mongoose, { Schema } from "mongoose";

export interface MachineDefinition
{
    name :string;
    ports :{inbound :number, outbound :number}[];
    supplement :any;
}

export interface Template
{
    _id :string;
    type :string;
    machineDefs: MachineDefinition[];
    supplement: any;
}

const TemplateSchema = new Schema({
    _id: {type: String, required: true},
    machineDefs: {type: [{
        name: String,
        ports: {
            inbound: {type :Number},
            outbound: {type: Number},
        },
        supplement: {type :Object}
    }], },
    supplement: {type: Object}
}, {discriminatorKey: 'type'})

export const TemplateModel = mongoose.model<Template>('Template', TemplateSchema);