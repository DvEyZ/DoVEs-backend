import { Request, Response } from 'express';
import { TemplateModel } from '../models/Template.model';
import { TemplateFactory } from '../models/factories/TemplateFactory.model';
import { ApiError } from '../utils/ApiError';

const TemplateController = {
    async list(req :Request, res :Response)
    {
        try
        {
            let templates = await TemplateModel.find();

            return res.json({
                templates: templates.map((v) => {
                    return {
                        name: v._id,
                        type: v.type
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
                'machineDefs' in req.body
            ))
                return res.json({message: 'Missing properties.'}).status(422);
            
            let model = TemplateFactory(req.body.type);

            if(!model)
                return res.json({message: 'Invalid template type'}).status(422); 

            let newTemplate = await model.create({
                _id: req.body.name,
                machineDefs: req.body.machineDefs,
                supplement: req.body.supplement
            });

            let template = await newTemplate.save();

            return res.json({
                name: template._id,
                type: template.type,
                machineDefs: template.machineDefs,
                supplement: template.supplement
            }).status(201);
        } 
        catch (e) 
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
            let template = await TemplateModel.findById(req.params.template);

            if(!template)
                return res.json({message: 'Not found'}).status(404);
            
            return res.json({
                name: template._id,
                type: template.type,
                machineDefs: template.machineDefs,
                supplement: template.supplement
            }).status(200)
        } 
        catch (e) 
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
                'machineDefs' in req.body
            ))
                return res.json({message: 'Missing properties.'}).status(422);

            let newTemplate = await TemplateModel.findById(req.body.name);

            if(!newTemplate)
                return res.json({message: 'Not found'}).status(404);

            newTemplate.machineDefs = req.body.machineDefs;
            newTemplate.supplement = req.body.supplement;

            let template = await newTemplate.save();
    
            return res.json({
                name: template._id,
                type: template.type,
                machineDefs: template.machineDefs,
                supplement: template.supplement
            }).status(201);
        } 
        catch (e) 
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
            let template = await TemplateModel.findByIdAndDelete(req.params.template);

            if(!template)
                return res.json({message: 'Not found'}).status(404);

            return res.json({
                name: template._id,
                type: template.type,
                machineDefs: template.machineDefs,
                supplement: template.supplement
            })
        } 
        catch (e) 
        {
            let message = 'Internal server error';
            let status = 500;
            if(e instanceof Error) message = e.message;
            if(e instanceof ApiError) status = e.status;
            return res.json({message: message}).status(status);
        }
    }, 
}

export default TemplateController;