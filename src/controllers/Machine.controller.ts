import createError from 'http-errors';
import { Request, Response } from 'express';

const MachineController = {
    list(req :Request, res :Response, next :any)
    {
        next(createError(501));
    },

    create(req :Request, res :Response, next :any)
    {
        next(createError(501));
    },
    
    fetch(req :Request, res :Response, next :any)
    {
        next(createError(501));
    },
    
    command(req :Request, res :Response, next :any)
    {
        next(createError(501));
    }, 
}

export default MachineController;