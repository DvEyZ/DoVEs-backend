import createError from 'http-errors';
import { Request, Response } from 'express';

const TemplateController = {
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
    
    update(req :Request, res :Response, next :any)
    {
        next(createError(501));
    },

    delete(req :Request, res :Response, next :any)
    {
        next(createError(501));
    }, 
}

export default TemplateController;