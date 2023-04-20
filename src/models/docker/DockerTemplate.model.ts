import { Template, TemplateModel } from "../Template.model";
import { Schema } from "mongoose";

export interface DockerTemplate extends Template
{
}

const DockerTemplateSchema = new Schema({})

export const DockerTemplateModel = TemplateModel.discriminator<DockerTemplate>('docker', DockerTemplateSchema);