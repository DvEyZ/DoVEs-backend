import mongoose, { Document, Schema } from "mongoose";

export interface MachineDefinition
{
    name :string;
    ports :Array<{inbound :string, outbound :string}>;
    supplement :object;
}

export interface Template extends Document
{
    _id :string;
    __t :string;
    machineDefs: Array<MachineDefinition>;
}

const TemplateSchema = new Schema({
    _id: {type: String, required: true}
})

export const TemplateModel = mongoose.model<Template>('Template', TemplateSchema);

export interface DockerTemplate extends Template
{
    composeBase :string;
}

const DockerTemplateSchema = new Schema({
    composeBase :{type: String, required: true}
})

export const DockerTemplateModel = TemplateModel.discriminator<DockerTemplate>('docker', DockerTemplateSchema);