import {NextFunction, Request, Response} from "express";
import {logger} from "../logger";
import {RouterOSAPI} from "node-routeros";

const className = 'routerOsMiddleware';

export class RouterOsMiddleware {
    constructor() {
        logger.debug(className);
    }

    async connectToRouter(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const host = req.query.host as string;
            if (!host) {
                return res.status(400).send('"host" field is required');
            }
            const user = req.query.user as string;
            if (!user) {
                return res.status(400).send('"user" field is required');
            }
            const password = req.query.password as string;
            if (!password) {
                return res.status(400).send('"password" field is required');
            }
            const port = process.env.TEST_ROUTER_PORT as any as number;
            const timeout = process.env.TEST_ROUTER_TIMEOUT as any as number;

            const routerOSAPI = new RouterOSAPI({
                host,
                user,
                password,
                port,
                timeout,
            });
            const api = await routerOSAPI.connect();
            if (!api.connected) {
                return res.status(400).send('Connection failed');
            }

            req.body.api = api;

            next();
        } catch (error) {
            console.error(error);
            logger.error('Internal Server Error');
            return res.status(500).send('Internal Server Error');
        }
    }
}
