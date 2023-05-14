import { Request, Response } from 'express';
import { LabModel } from '../models/Lab.model';
import { ApiError } from '../utils/ApiError';

const MachineController = {
    async list(req :Request, res :Response)
    {
        try
        {
            let lab = await LabModel.findOne({name: req.params.lab});
            if(!lab)
                return res.status(404).json({message: 'Not found'});

            let m = await lab.getMachines();

            return res.status(200).json({
                machines: m.map((v) => {
                    return {
                        name: v.name,
                        status: v.status,   
                    }
                })
            })
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
            let lab = await LabModel.findOne({name: req.params.lab});
            if(!lab)
                return res.status(404).json({message: 'Not found'});
            
            let machine = await lab.getMachine(req.params.machine);

            return res.status(200).json({
                name: machine.name,
                type: lab.type,
                status: machine.status,
                address: machine.address,
                ports: machine.portRedirections
            })
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
            
            let machine = await lab.getMachine(req.params.machine);
            
            let op = req.body.action;

            if(!(['start','stop','restart'].includes(op)))
            {
                return res.status(400).json({message: 'Invalid operation'});
            }
            
            if(op === 'start')
                await machine.start();
            else if(op === 'stop')
                await machine.stop();
            else if(op === 'restart')
                await machine.restart();

            let newMachine = await lab.getMachine(req.params.machine);

            return res.status(200).json({
                name: newMachine.name,
                type: lab.type,
                status: newMachine.status,
                address: newMachine.address,
                ports: newMachine.portRedirections
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
}

export default MachineController;