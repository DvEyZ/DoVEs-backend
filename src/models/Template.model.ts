import mongoose, { Document, Schema } from "mongoose";

export interface MachineDefinition
{
    name :string;
    ports :Array<{inbound :string, outbound :string}>;
    supplement :any;
}

export interface Template extends Document
{
    _id :string;
    __t :string;
    machineDefs: Array<MachineDefinition>;
    supplement: object;
}

const TemplateSchema = new Schema({
    _id: {type: String, required: true}
})

export const TemplateModel = mongoose.model<Template>('Template', TemplateSchema);