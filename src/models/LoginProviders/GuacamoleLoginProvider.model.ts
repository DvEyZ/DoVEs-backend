import { LoginProvider } from "./LoginProvider.model";

export interface GuacamoleLoginProvideer extends LoginProvider
{
    config: {
        apiUrl: string;
        adminUsername: string;
        adminPassword: string;
    }
}