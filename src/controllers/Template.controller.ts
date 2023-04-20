import { Request, Response } from 'express';
import { TemplateModel } from '../models/Template.model';
import { TemplateFactory } from '../models/TemplateFactory.model';

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
                        type: v.__t
                    }
                })
            }).status(200);
        }
        catch(e)
        {
            // Add error handling
        }
    },

    async create(req :Request, res :Response)
    {
        try 
        {
            let model = TemplateFactory(req.body.type);

            if(!model)
                return res.json({message: 'Invalid type'}).status(400); 

            let newTemplate = await model.create({
                _id: req.body.name,
                machineDefs: req.body.machineDefs,
                supplement: req.body.supplement
            });

            let template = await newTemplate.save();

            return res.json({
                name: template._id,
                type: template.__t,
                machineDefs: template.machineDefs,
                supplement: template.supplement
            }).status(201);
        } 
        catch (e) 
        {
            // Add error handling
        }
    },
    
    async fetch(req :Request, res :Response)
    {
        try 
        {
            let template = await TemplateModel.findById(req.body.name);

            if(!template)
                return res.json({message: 'Not found'}).status(404);
            
            return res.json({
                name: template._id,
                type: template.__t,
                machineDefs: template.machineDefs,
                supplement: template.supplement
            }).status(200)
        } 
        catch (e) 
        {
            // Add error handling
        }
    },
    
    async update(req :Request, res :Response)
    {
        try 
        {
            let newTemplate = await TemplateModel.findById(req.body.name);

            if(!newTemplate)
                return res.json({message: 'Not found'}).status(404);

            newTemplate.machineDefs = req.body.machineDefs;
            newTemplate.supplement = req.body.supplement;

            let template = await newTemplate.save();
    
            return res.json({
                name: template._id,
                type: template.__t,
                machineDefs: template.machineDefs,
                supplement: template.supplement
            }).status(201);
        } 
        catch (e) 
        {
            // Add error handling
        }
    },

    async delete(req :Request, res :Response)
    {
        try 
        {
            let template = await TemplateModel.findByIdAndDelete(req.body.name);

            if(!template)
                return res.json({message: 'Not found'}).status(404);

            return res.json({
                name: template._id,
                type: template.__t,
                machineDefs: template.machineDefs,
                supplement: template.supplement
            })
        } 
        catch (e) 
        {
            // Add error handling
        }
    }, 
}

export default TemplateController;