import { Request, Response } from 'express';
import { Lab, LabModel } from '../models/Lab.model';
import { LabFactory } from '../models/factories/LabFactory.model';

const getUpStatus = async(lab :Lab) :Promise<Number> =>
{
    return lab.getMachines().then((machines) => {
        let run = machines.filter((v) => v.status == 'running')
        return Number((run.length / machines.length).toPrecision(2)) * 100
    }).catch((e) => {
        throw new Error(e)
    });
}

const LabController = {
    async list(req :Request, res :Response)
    {
        try
        {
            let labs = await LabModel.find();
            return res.json({
                labs: labs.map(async (lab) => {
                    return {
                        name: lab._id,
                        type: lab.__t,
                        up: await getUpStatus(lab),
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
                'template' in req.body &&
                'portPrefix' in req.body &&
                'machineCount' in req.body &&
                'loginProviders' in req.body
            ))
                return res.json({message: 'Missing properties.'}).status(422);

            let model = LabFactory(req.body.type);

            if(!model)
                return res.json({message: 'Invalid lab type.'}).status(422);

            let lab :Lab = await model.create({
                _id: req.body.name,
                template: req.body.template,
                portPrefix: req.body.portPrefix,
                machineCount: req.body.machineCount,
                loginProviders: req.body.loginProviders
            });
            
            return res.json({
                name: lab._id,
                type: lab.__t,
                up: await getUpStatus(lab),
                template: lab.template,
                machines: (await lab.getMachines()).map((machine) => {
                    return {
                        name: machine.name,
                        status: machine.status
                    }
                })
            }).status(201);
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
            let lab = await LabModel.findById(req.params.lab).populate('loginProviders');
            if(!lab) 
            {
                return res.json({message: 'Not found'}).status(404);
            }

            res.json({
                name: lab._id,
                type: lab.__t,
                up: await getUpStatus(lab),
                template: lab.template,
                machines: (await lab.getMachines()).map((machine) => {
                    return {
                        name: machine.name,
                        status: machine.status
                    }
                }),
                loginProviders: lab.loginProviders

            }).status(201);
        }
        catch(e)
        {
            let message = 'Internal server error';
            let status = 500;
            if(e instanceof Error) message = e.message;
            if(e instanceof TypeError) status = 400;
            return res.json({message: message}).status(status);
        }
    },
    
    async command(req :Request, res :Response)
    {
        try
        {
            if(!(
                'op' in req.body
            ))
                return res.json({message: 'Missing properties.'}).status(422);
            
            let lab = await LabModel.findById(req.params.lab);
            if(!lab) 
                return res.json({message: 'Not found'}).status(404);

            let op = req.body.action;


            if(op == 'start')
                await lab.start();
            else if(op == 'stop')
                await lab.stop();
            else if(op == 'restart')
                await lab.restart();
            else
                return res.json({message: 'Invalid operation'}).status(400);
            
            let nLab = await LabModel.findById(req.params.lab).populate('loginProviders');

            return res.json({
                name: nLab!._id,
                type: nLab!.__t,
                up: await getUpStatus(nLab!),
                template: nLab!.template,
                machines: (await nLab!.getMachines()).map((machine) => {
                    return {
                        name: machine.name,
                        status: machine.status
                    }
                }),
                loginProviders: nLab!.loginProviders
            }).status(201);
        }
        catch(e)
        {
            let message = 'Internal server error';
            let status = 500;

            return res.json({message: message}).status(status);
        }
    }, 
    
    async delete(req :Request, res :Response, next :any)
    {
        try
        {
            let lab = await LabModel.findByIdAndDelete(req.params.id);

            if(!lab)
            {
                return res.json({message: 'Not found'}).status(404)
            }

            return res.json({
                name: lab._id,
                type: lab.__t,
                template: lab.template
            }).status(200);
        }
        catch(e)
        {
            let message = 'Internal server error';
            let status = 500;

            return res.json({message: message}).status(status);
        }
    }
}

export default LabController;