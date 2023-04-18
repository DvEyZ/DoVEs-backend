import { Machine } from "../models/Machine.model";

export interface LoginProvider
{
    createLogin(machine :Machine) :Promise<any>;
    removeLogin(name :string) :Promise<any>;
}