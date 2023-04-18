import { Model, Schema } from "mongoose";
import { DockerLabModel } from "./docker/DockerLab.model";

export const LabFactory = (type :string) :Model<any> | undefined => {
    if(type == 'docker') return DockerLabModel;
    throw new Error('Invalid lab type.')
}