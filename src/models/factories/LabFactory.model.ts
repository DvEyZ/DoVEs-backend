import { Model } from "mongoose";
import { DockerLabModel } from "../docker/DockerLab.model";
import { Lab } from "../Lab.model";

export const LabFactory = (type :string) :Model<Lab> | undefined => {
    if(type === 'docker') return DockerLabModel;
    return undefined;
}