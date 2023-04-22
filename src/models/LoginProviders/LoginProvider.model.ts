import mongoose, { Schema } from "mongoose";

export interface LoginProvider
{
    _id :string;
    __t :string;
    config :any;

    createEnvironment(name :string) :Promise<any>;
    createConnection(name :string, host :string, port :number) :Promise<any>;

    tearDownConnection(name :string) :Promise<any>;
    tearDownEnvironment(name :string) :Promise<any>;
}

export const LoginProviderSchema = new Schema({
    _id: {type: String, required: true},
    config: {type: Object, required: true}
});

export const LoginProviderModel = mongoose.model<LoginProvider>('LoginProvider', LoginProviderSchema)