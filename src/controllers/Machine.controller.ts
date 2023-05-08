import { Request, Response } from 'express';
import { LabModel } from '../models/Lab.model';
import { ApiError } from '../utils/ApiError';

const MachineController = {
    async list(req :Request, res :Response)
    {
        try
        {
            let lab = await LabModel.findById(req.params.lab);
            if(!lab)
                return res.json({message: 'Not found'}).status(404);

            let m = await lab.getMachines();

            return res.json({
                machines: m.map((v) => {
                    return {
                        name: v.name,
                        status: v.status,   
                    }
                })
            }).status(200)
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
            let lab = await LabModel.findById(req.params.lab);
            if(!lab)
                return res.json({message: 'Not found'}).status(404);
            
            let machine = await lab.getMachine(req.params.machine);

            return res.json({
                name: machine.name,
                status: machine.status,
                address: machine.address
            }).status(200)
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
            
            let machine = await lab.getMachine(req.params.machine);

            let op = req.body.action;

            if(!(['start','stop','restart'].includes(op)))
            {
                return res.json({message: 'Invalid operation'}).status(400);
            }
            
            if(op === 'start')
                await machine.start();
            else if(op === 'stop')
                await machine.stop();
            else if(op === 'restart')
                await machine.restart();

            let newMachine = await lab.getMachine(req.params.machine);

            return res.json({
                name: newMachine.name,
                status: newMachine.status,
                address: newMachine.address
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
}

export default MachineController;