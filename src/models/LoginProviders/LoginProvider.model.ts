import mongoose, { Schema } from "mongoose";

export interface LoginProvider
{
    name :string;
    type :string;
    config :any;

    testConnection() :Promise<any>

    createEnvironment(name :string, config :any) :Promise<any>;
    createConnection(name :string, group :string, host :string, port :number, config :any) :Promise<any>;

    tearDownConnection(name :string) :Promise<any>;
    tearDownEnvironment(name :string) :Promise<any>;
}

export const LoginProviderSchema = new Schema({
    name: {type: String, required: true, unique: true},
    config: {type: Object, required: true}
}, {discriminatorKey: 'type'});

export const LoginProviderModel = mongoose.model<LoginProvider>('LoginProvider', LoginProviderSchema)