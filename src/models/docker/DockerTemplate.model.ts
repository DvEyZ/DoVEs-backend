import { Template, TemplateModel } from "../Template.model";
import { Schema } from "mongoose";

export interface DockerTemplate extends Template
{
    
}

const DockerTemplateSchema = new Schema({
    supplement: {
        base: {type: String}
    }
})

export const DockerTemplateModel = TemplateModel.discriminator<DockerTemplate>('docker', DockerTemplateSchema);