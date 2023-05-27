import { Schema } from "mongoose";
import { LoginProvider, LoginProviderModel } from "./LoginProvider.model";
import { GuacamoleService } from "../../services/Guacamole.service";
import LoginProviderConfig from "../../configs/LoginProviders.config";
import { ApiError } from "../../utils/ApiError";

export interface GuacamoleLoginProvider extends LoginProvider
{
    config: {
        apiUrl: string;
        adminUsername: string;
        adminPassword: string;
    }
}

export const GuacamoleLoginProviderSchema = new Schema({
    config: {
        type: {
            apiUrl: {type: String, required: true},
            adminUsername: {type: String, required: true},
            adminPassword: {type: String, required: true}
        },
        required: true
    }
});

GuacamoleLoginProviderSchema.methods.testConnection = async function () :Promise<any> {
    let guacamole = new GuacamoleService(this.config.apiUrl, this.config.adminUsername, this.config.adminPassword);
    try
    {
        await guacamole.check();
    }
    catch(e)
    {
        throw new ApiError(500, `Could not connect to ${this.config.apiUrl}. Make sure the server is up, and check the password you provided. 
        Details: ${e}`)
    }
}

GuacamoleLoginProviderSchema.methods.createEnvironment = async function (name :string, config :{}) :Promise<any> {
    await this.testConnection();

    let guacamole = new GuacamoleService(this.config.apiUrl, this.config.adminUsername, this.config.adminPassword);
    
    await guacamole.userGroup(name).create();
    await guacamole.connectionGroup(name).create();
}

GuacamoleLoginProviderSchema.methods.createConnection = async function (name :string, group :string, host :string, port :number, config :{
    protocol: string
}) :Promise<any> {
    await this.testConnection();

    let guacamole = new GuacamoleService(this.config.apiUrl, this.config.adminUsername, this.config.adminPassword);
    
    await guacamole.user(name).create(LoginProviderConfig.defaultPassword);
    await guacamole.connection(name).create(group, config.protocol, host, port);
    await guacamole.user(name).addUserGroup(group);
    await guacamole.user(name).addConnectionGroup(group);
    await guacamole.user(name).addConnection(name);
}
    

GuacamoleLoginProviderSchema.methods.tearDownEnvironment = async function (name :string) :Promise<any> {
    await this.testConnection();

    let guacamole = new GuacamoleService(this.config.apiUrl, this.config.adminUsername, this.config.adminPassword);

    await guacamole.userGroup(name).delete();
    await guacamole.connectionGroup(name).delete();
}

GuacamoleLoginProviderSchema.methods.tearDownConnection = async function (name :string) :Promise<any> {
    await this.testConnection();
    
    let guacamole = new GuacamoleService(this.config.apiUrl, this.config.adminUsername, this.config.adminPassword);

    await guacamole.user(name).delete();
    await guacamole.connection(name).delete();
}

export const GuacamoleLoginProviderModel = 
    LoginProviderModel.discriminator<GuacamoleLoginProvider>('LoginProvider:guacamole', GuacamoleLoginProviderSchema, 'guacamole');