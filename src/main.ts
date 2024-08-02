import express, {Express, Request, Response} from 'express';
import dotenv from 'dotenv';
import bodyParser from "body-parser";
import Routes from './controller/router';

dotenv.config()
const { startBrokerChannel } = require('./utils/utils');

const app: Express = express();
const hostname: string = String(process.env.HOST) || 'localhost';
const port: number = Number(process.env.HOST_PORT) || 8080;

app.use(bodyParser.json());
startBrokerChannel();

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({'message': 'Welcome to my site!'})
});
app.use("/api", Routes);

app.listen(port, hostname, () => console.log(`Server running on ${hostname}:${port}`));