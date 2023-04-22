import mongoose, { Schema } from "mongoose";

export interface MachineDefinition
{
    name :string;
    ports :Array<{inbound :string, outbound :string}>;
    supplement :any;
}

export interface Template
{
    _id :string;
    type :string;
    machineDefs: Array<MachineDefinition>;
    supplement: any;
}

const TemplateSchema = new Schema({
    _id: {type: String, required: true}
}, {discriminatorKey: 'type'})

export const TemplateModel = mongoose.model<Template>('Template', TemplateSchema);