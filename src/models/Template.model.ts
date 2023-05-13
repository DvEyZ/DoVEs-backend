import mongoose, { Schema } from "mongoose";


export interface Template
{
    name :string;
    type :string;
    machineDefs: {
        name :string;
        ports :{inbound :number, outbound :number}[];
        supplement :any;
    }[];
    supplement: any;
}

const TemplateSchema = new Schema({
    name: {type: String, required: true, unique: true},
    machineDefs: {type: [{
        name: {type: String},
        ports: {
            type: [{
                inbound: {type :Number},
                outbound: {type: Number},
            }]
        },
        supplement: {type :Object}
    }], required: true},
    supplement: {type: Object}
}, {discriminatorKey: 'type'})

export const TemplateModel = mongoose.model<Template>('Template', TemplateSchema);