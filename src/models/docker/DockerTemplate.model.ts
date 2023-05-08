import { Template, TemplateModel } from "../Template.model";
import mongoose, { Schema } from "mongoose";

export interface DockerTemplate extends Template
{
    supplement: {
        base: string
    }
}

const DockerTemplateSchema = new Schema({})

export const DockerTemplateModel = TemplateModel.discriminator<DockerTemplate>('Template:docker', DockerTemplateSchema, 'docker');