import { Model, Schema } from "mongoose";
import { DockerTemplateModel } from "./Template.model";

export const TemplateFactory = (type :string) :Model<any> | undefined => {
    if(type == 'docker') return DockerTemplateModel;
    throw new Error('Invalid lab type.')
}