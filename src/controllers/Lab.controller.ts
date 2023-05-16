import { Request, Response } from 'express';
import { Lab, LabModel } from '../models/Lab.model';
import { LabFactory } from '../models/factories/LabFactory.model';
import { ApiError } from '../utils/ApiError';
import { TemplateModel } from '../models/Template.model';
import { LoginProviderModel } from '../models/LoginProviders/LoginProvider.model';

const getUpStatus = async(lab :Lab) :Promise<Number> =>
{
    let maxines = await lab.getMachines();
    let run = maxines.filter((v) => v.status == 'running')
    return Number((run.length / lab.machineCount).toPrecision(2)) * 100
}

const LabController = {
    async list(req :Request, res :Response)
    {
        try
        {
            let labs = await LabModel.find();

            return res.status(200).json({
                labs: await Promise.all(labs.map(async (lab) => {
                    return {
                        name: lab.name,
                        type: lab.type,
                        up: await getUpStatus(lab),
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
                'template' in req.body &&
                'portPrefix' in req.body &&
                'machineCount' in req.body &&
                'loginProviders' in req.body
            ))
                return res.status(422).json({message: 'Missing properties.'});

            if(await LabModel.findOne({name: req.body.name}))
                return res.status(409).json({message: `Lab ${req.body.name} already exists.`})

            let model = LabFactory(req.body.type);

            if(!model)
                return res.status(422).json({message: 'Invalid lab type.'});

            let lab = new model({
                name: req.body.name,
                template: await (async () => 
                    {
                        let id = (await TemplateModel.findOne({name: req.body.template}))?._id;
                        if(!id)
                            throw new ApiError(404, `Template ${req.body.template} not found.`)
                        return id;
                    })(),
                portPrefix: req.body.portPrefix,
                machineCount: req.body.machineCount,
                loginProviders: await Promise.all(req.body.loginProviders.map(async (v :string) => {
                    let id = (await LoginProviderModel.findOne({name: v}))?._id;
                    if(!id)
                        throw new ApiError(404, `Login provider ${v} not found.`)
                    return id;
                }))
            });

            await lab.labUp().catch((e) => {throw e});
            await lab.loginProvidersInit().catch((e) => {throw e});

            await lab.save();

            let nLab = await LabModel.findOne({name: req.body.name}).populate('template').populate('loginProviders');
            
            return res.status(201).json({
                name: nLab!.name,
                type: nLab!.type,
                up: await getUpStatus(nLab!),
                template: nLab!.template,
                portPrefix: nLab!.portPrefix,
                machines: (await nLab!.getMachines()).map((machine) => {
                    return {
                        name: machine.name,
                        status: machine.status
                    }
                }),
                loginProviders: nLab!.loginProviders
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
            let lab = await LabModel.findOne({name: req.params.lab}).populate('template').populate('loginProviders');
            if(!lab) 
            {
                return res.status(404).json({message: 'Not found'});
            }

            res.status(201).json({
                name: lab.name,
                type: lab.type,
                up: await getUpStatus(lab),
                template: lab.template,
                portPrefix: lab.portPrefix,
                machines: (await lab.getMachines()).map((machine) => {
                    return {
                        name: machine.name,
                        status: machine.status
                    }
                }),
                loginProviders: lab.loginProviders

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
    
    async command(req :Request, res :Response)
    {
        try
        {
            if(!(
                'action' in req.body
            ))
                return res.status(422).json({message: 'Missing properties.'});
            
            let lab = await LabModel.findOne({name: req.params.lab});
            if(!lab) 
                return res.status(404).json({message: 'Not found'});

            let op = req.body.action;


            if(op == 'start')
                await lab.start();
            else if(op == 'stop')
                await lab.stop();
            else if(op == 'restart')
                await lab.restart();
            else
                return res.status(400).json({message: 'Invalid operation'});
            
            let nLab = await LabModel.findOne({name: req.params.lab}).populate('template').populate('loginProviders');

            return res.status(200).json({
                name: nLab!.name,
                type: nLab!.type,
                up: await getUpStatus(nLab!),
                template: nLab!.template,
                portPrefix: nLab!.portPrefix,
                machines: (await nLab!.getMachines()).map((machine) => {
                    return {
                        name: machine.name,
                        status: machine.status
                    }
                }),
                loginProviders: nLab!.loginProviders
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
    
    async delete(req :Request, res :Response, next :any)
    {
        try
        {
            let lab = await LabModel.findOne({name: req.params.lab}).populate('template').populate('loginProviders');

            if(!lab)
            {
                return res.status(404).json({message: 'Not found'})
            }

            await lab.loginProvidersDown().catch((e) => {throw e});
            await lab.labDown().catch((e) => {throw e});

            let nLab = await lab.deleteOne();

            return res.status(200).json({
                name: nLab.name,
                type: nLab.type,
                template: nLab.template,
                portPrefix: nLab.portPrefix,
                loginProviders: nLab.loginProviders
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

export default LabController;