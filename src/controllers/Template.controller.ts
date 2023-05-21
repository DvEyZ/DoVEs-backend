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

            return res.status(200).json({
                templates: templates.map((v) => {
                    return {
                        name: v.name,
                        type: v.type
                    }
                })
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

    async create(req :Request, res :Response)
    {
        try
        {
            if(!(
                'name' in req.body && 
                'type' in req.body && 
                'machineDefs' in req.body
            ))
                return res.status(422).json({message: 'Missing properties.'});

            if(await TemplateModel.findOne({name: req.body.name}))
                return res.status(409).json({message: `Template ${req.body.name} already exists`})
            
            let model = TemplateFactory(req.body.type);

            if(!model)
                return res.status(422).json({message: 'Invalid template type'}); 

            let newTemplate = await model.create({
                name: req.body.name,
                machineDefs: req.body.machineDefs,
                supplement: req.body.supplement
            });

            let template = await newTemplate.save();

            return res.status(201).json({
                name: template.name,
                type: template.type,
                machineDefs: template.machineDefs,
                supplement: template.supplement
            });
        } 
        catch (e) 
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
            let template = await TemplateModel.findOne({name: req.params.template});

            if(!template)
                return res.status(404).json({message: 'Not found'});
            
            return res.status(200).json({
                name: template.name,
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
            return res.status(status).json({message: message});
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
                return res.status(422).json({message: 'Missing properties.'});

            let newTemplate = await TemplateModel.findOne({name: req.body.name});

            if(!newTemplate)
                return res.status(404).json({message: 'Not found'});

            newTemplate.machineDefs = req.body.machineDefs;
            newTemplate.supplement = req.body.supplement;

            let template = await newTemplate.save();
    
            return res.status(201).json({
                name: template.name,
                type: template.type,
                machineDefs: template.machineDefs,
                supplement: template.supplement
            });
        } 
        catch (e) 
        {
            let message = 'Internal server error';
            let status = 500;
            if(e instanceof Error) message = e.message;
            if(e instanceof ApiError) status = e.status;
            return res.status(status).json({message: message})
        }
    },

    async delete(req :Request, res :Response)
    {
        try 
        {
            let template = await TemplateModel.findOneAndDelete({name: req.params.template});

            if(!template)
                return res.status(404).json({message: 'Not found'});

            return res.json({
                name: template.name,
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
            return res.status(status).json({message: message});
        }
    }, 
}

export default TemplateController;