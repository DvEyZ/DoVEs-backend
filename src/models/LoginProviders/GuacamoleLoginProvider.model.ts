import { Schema } from "mongoose";
import { LoginProvider, LoginProviderModel } from "./LoginProvider.model";

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

GuacamoleLoginProviderSchema.methods.createEnvironment = async (name :string, config :{}) :Promise<any> => {
    // Create Guacamole groups
}

GuacamoleLoginProviderSchema.methods.createConnection = async (name :string, group :string, host :string, port :number, config :{
    protocol: string
}) :Promise<any> => {
    // Create Guacamole users and connections
}

GuacamoleLoginProviderSchema.methods.tearDownEnvironment = async (name :string) :Promise<any> => {
    // Delete Guacamole groups
}

GuacamoleLoginProviderSchema.methods.tearDownConnection = async (name :string) :Promise<any> => {
    // Delete Guacamole users and connections
}

export const GuacamoleLoginProviderModel = LoginProviderModel.discriminator<GuacamoleLoginProvider>('guacamole', GuacamoleLoginProviderSchema);