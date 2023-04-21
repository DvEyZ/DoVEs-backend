import { Model } from "mongoose";
import { Template } from "../Template.model";
import { DockerTemplateModel } from "../docker/DockerTemplate.model";

export const TemplateFactory = (type :string) :Model<Template> | undefined => {
    if(type === 'docker') return DockerTemplateModel;
    return undefined;
}