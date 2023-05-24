import { Request,Response } from "express";
import { LoginProviderModel } from "../models/LoginProviders/LoginProvider.model";
import { LoginProviderFactory } from "../models/factories/LoginProviderFactory.model";
import { ApiError } from "../utils/ApiError";

const LoginProviderController = {
    async list(req :Request, res :Response)
    {
        try
        {
            let providers = await LoginProviderModel.find();

            return res.status(200).json({
                loginProviders: await Promise.all(providers.map(async (v) => {
                    let r = true;
                    await v.testConnection().catch((e) => {r = false});
                    
                    return {
                        name: v.name,
                        type: v.type,
                        reachable: r
                    }
                }))
            });
        }
        catch(e)
        {
            let message = 'Internal server error';
            let status = 500;
            if(e instanceof Error) message = e.message;
            if(e instanceof ApiError) status = e.status;
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
                return res.status(422).json({message: 'Missing properties.'});

            if(await LoginProviderModel.findOne({name: req.body.name}))
                return res.status(409).json({message: `Login provider ${req.body.name} already exists`})

            let model = LoginProviderFactory(req.body.type);

            if(!model)
                return res.status(422).json({message: 'Invalid login provider type.'});

            let newProvider = new model({
                name: req.body.name,
                type: req.body.type,
                config: req.body.config
            });

            await newProvider.testConnection();

            let provider = await newProvider.save();

            return res.status(201).json({
                name: provider.name,
                type: provider.type,
                config: provider.config,
            });
        }
        catch(e)
        {
            let message = 'Internal server error';
            let status = 500;
            if(e instanceof Error) message = e.message;
            if(e instanceof ApiError) status = e.status;
            return res.status(status).json({message: message});
        }
    },

    async fetch(req :Request, res :Response)
    {
        try
        {
            let provider = await LoginProviderModel.findOne({name: req.params.provider});

            if(!provider)
                return res.status(404).json({message: 'Not found'})

            let r = true;
            await provider.testConnection().catch((e) => {r = false});

            return res.status(200).json({
                name: provider.name,
                type: provider.type,
                config: provider.config,
                reachable: r
            });
        }
        catch(e)
        {
            let message = 'Internal server error';
            let status = 500;
            if(e instanceof Error) message = e.message;
            if(e instanceof ApiError) status = e.status;
            return res.json({message: message}).status(status);
        }
    },

    async update(req :Request, res :Response)
    {
        try
        {
            if(!(
                'name' in req.body && 
                'type' in req.body && 
                'config' in req.body
            ))
                return res.status(422).json({message: 'Missing properties.'});

            let newProvider = await LoginProviderModel.findOne({name: req.params.provider});

            if(!newProvider)
                return res.status(404).json({message: 'Not found'});

            newProvider.config = req.body.config;

            let provider = await newProvider.save();

            return res.status(200).json({
                name: provider.name,
                type: provider.type,
                config: provider.config,
            });
        }
        catch(e)
        {
            let message = 'Internal server error';
            let status = 500;
            if(e instanceof Error) message = e.message;
            if(e instanceof ApiError) status = e.status;
            return res.json({message: message}).status(status);
        }
    },

    async delete(req :Request, res :Response)
    {
        try
        {
            let provider = await LoginProviderModel.findOneAndDelete({name: req.params.provider});

            if(!provider)
                return res.status(404).json({message: 'Not found'});

            return res.status(200).json({
                name: provider.name,
                type: provider.type,
                config: provider.config,
            });
        }
        catch(e)
        {
            let message = 'Internal server error';
            let status = 500;
            if(e instanceof Error) message = e.message;
            if(e instanceof ApiError) status = e.status;
            return res.status(status).json({message: message});
        }
    }
}

export default LoginProviderController;