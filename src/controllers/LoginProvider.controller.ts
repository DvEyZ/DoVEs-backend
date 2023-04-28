import { Request,Response } from "express";
import { LoginProviderModel } from "../models/LoginProviders/LoginProvider.model";

const LoginProviderController = {
    async list(req :Request, res :Response)
    {
        try
        {
            let providers = await LoginProviderModel.find();

            return res.json({
                loginProviders: providers.map((v) => {
                    return {
                        name: v._id,
                        type: v.type,
                    }
                })
            }).status(200);
        }
        catch(e)
        {
            let message = 'Internal server error';
            let status = 500;

            return res.json({message: message}).status(status);
        }
    },

    async create(req :Request, res :Response)
    {
        try
        {
            if(!(
                'name' in req.body && 
                'type' in req.body && 
                'config' in req.body
            ))
                return res.json({message: 'Missing properties.'}).status(422);

            // TODO
        }
        catch(e)
        {
            let message = 'Internal server error';
            let status = 500;

            return res.json({message: message}).status(status);
        }
    },

    async fetch(req :Request, res :Response)
    {
        try
        {
            // TODO
        }
        catch(e)
        {
            let message = 'Internal server error';
            let status = 500;

            return res.json({message: message}).status(status);
        }
    },

    async update(req :Request, res :Response)
    {
        try
        {
            // TODO
        }
        catch(e)
        {
            let message = 'Internal server error';
            let status = 500;

            return res.json({message: message}).status(status);
        }
    },

    async delete(req :Request, res :Response)
    {
        try
        {
            // TODO
        }
        catch(e)
        {
            let message = 'Internal server error';
            let status = 500;

            return res.json({message: message}).status(status);
        }
    }
}

export default LoginProviderController;