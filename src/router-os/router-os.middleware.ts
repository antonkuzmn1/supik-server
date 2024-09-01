/*

Copyright 2024 Anton Kuzmin (https://github.com/antonkuzmn1)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

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
        } catch (error: unknown) {
            if (error instanceof Error) {
                logger.error(error.message);
                return res.status(500).send(error.message);
            } else {
                logger.error('Unexpected error');
                return res.status(500).send('Unexpected error');
            }
        }
    }
}
