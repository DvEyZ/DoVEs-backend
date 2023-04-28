import { Model } from "mongoose";
import { LoginProvider } from "../LoginProviders/LoginProvider.model";
import { LoginProviderModel } from "../LoginProviders/LoginProvider.model";
import { GuacamoleLoginProviderModel } from "../LoginProviders/GuacamoleLoginProvider.model";

export const LoginProviderFactory = (type :string) :Model<LoginProvider> | undefined => {
    if(type === 'guacamole') return GuacamoleLoginProviderModel;
    return undefined;
}