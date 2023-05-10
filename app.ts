import createError from 'http-errors';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import express, { Express, Request, Response } from 'express'

import aboutRouter from './src/routes/About.routes'
import labsRouter from './src/routes/Labs.routes';
import templateRouter from './src/routes/Templates.routes';
import loginProviderRouter from './src/routes/LoginProviders.routes';

import { connectDb } from './src/services/MongoDB.service';
import cors from 'cors';

var app :Express = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors())

app.use('/about', aboutRouter);
app.use('/labs', labsRouter);
app.use('/templates', templateRouter);
app.use('/loginProviders', loginProviderRouter);

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'DoVEs backend API'
    })
})

app.use((req :Request, res :Response, next :any) => {
    next(createError(404));
});

// error handler
interface ExpressError extends Error {
    status?: number;
}

app.use((err :ExpressError, req :Request, res :Response, next :any) => {
    res.status(err.status || 500).send({error: err.message});
});

connectDb().then(() => {
    app.listen(3001, () => {
        console.log('Listening on http://localhost:3001')
    })
}).catch((e) => {console.error(e)});

module.exports = app;
