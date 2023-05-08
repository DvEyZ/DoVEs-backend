import createError from 'http-errors';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import express, { Express, Request, Response } from 'express'
import labsRouter from './src/routes/Labs.routes';
import templateRouter from './src/routes/Templates.routes';
import { connectDb } from './src/services/MongoDB.service';

var app :Express = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/labs', labsRouter);
app.use('/templates', templateRouter);

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

connectDb();

app.listen(3001, () => {
    console.log('Listening on http://localhost:3001')
})
module.exports = app;
