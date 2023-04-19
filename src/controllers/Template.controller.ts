import createError from 'http-errors';
import { Request, Response } from 'express';
import { Template, TemplateModel } from '../models/Template.model';
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
            
        } 
        catch (e) 
        {
            // Add error handling
        }
    }, 
}

export default TemplateController;