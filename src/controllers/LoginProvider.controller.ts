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
                return res.json({message: 'Missing properties.'}).status(422);

            let model = LoginProviderFactory(req.body.type);

            if(!model)
                return res.json({message: 'Invalid login provider type.'}).status(422);

            let newProvider = await model.create({
                _id: req.body.name,
                type: req.body.type,
                config: req.body.config
            });

            let provider = await newProvider.save();

            return res.json({
                name: provider._id,
                type: provider.type,
                config: provider.config,
            }).status(201);
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

    async fetch(req :Request, res :Response)
    {
        try
        {
            let provider = await LoginProviderModel.findById(req.params.provider);

            if(!provider)
                return res.json({message: 'Not found'}).status(404);

            return res.json({
                name: provider._id,
                type: provider.type,
                config: provider.config,
            }).status(200);
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
                return res.json({message: 'Missing properties.'}).status(422);

            let newProvider = await LoginProviderModel.findById(req.params.provider);

            if(!newProvider)
                return res.json({message: 'Not found'}).status(404);

            newProvider.config = req.body.config;

            let provider = await newProvider.save();

            return res.json({
                name: provider._id,
                type: provider.type,
                config: provider.config,
            }).status(200);
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
            let provider = await LoginProviderModel.findByIdAndDelete(req.params.provider);

            if(!provider)
                return res.json({message: 'Not found'}).status(404);

            return res.json({
                name: provider._id,
                type: provider.type,
                config: provider.config,
            }).status(200);
        }
        catch(e)
        {
            let message = 'Internal server error';
            let status = 500;
            if(e instanceof Error) message = e.message;
            if(e instanceof ApiError) status = e.status;
            return res.json({message: message}).status(status);
        }
    }
}

export default LoginProviderController;