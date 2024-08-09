import express, {Express, Request, Response, NextFunction} from 'express';
import dotenv from 'dotenv';
import Routes from './controller/router';

dotenv.config()
import { startBrokerChannel } from './utils/utils';

const bodyParser = require('body-parser')
const app: Express = express();
const hostname: string = String(process.env.HOST) || 'localhost';
const port: number = Number(process.env.HOST_PORT) || 8080;

app.use(function (req: Request, res: Response, next: NextFunction) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions
    res.setHeader('Access-Control-Allow-Credentials', 1);
    next();
});

app.use(bodyParser.json());
startBrokerChannel();

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({'message': 'Welcome to my site!'})
});
app.use("/api", Routes);

app.listen(port, hostname, () => console.log(`Server running on ${hostname}:${port}`));