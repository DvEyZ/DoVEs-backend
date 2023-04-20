import { Request, Response } from 'express';
import { LabModel } from '../models/Lab.model';

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
            // Error handling
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
            // Error handling
        }
    },
    
    async command(req :Request, res :Response)
    {
        try
        {
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
            // Error handling
        }
    }, 
}

export default MachineController;