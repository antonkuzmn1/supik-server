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

import {Request, Response} from 'express';
import {logger} from "../logger";
import {prisma} from "../prisma";

export interface NewLog {
    action: 'create' | 'update' | 'delete',
    newValue: any,
    initiatorId: number,
    accountId?: number,
    groupId?: number,
    routerId?: number,
    vpnId?: number,
    vpnRouterId?: number,
    userId?: number,
}

const className = 'LogService';

export class LogService {
    constructor() {
        logger.debug(className);
    }

    async getAll(req: Request, res: Response): Promise<Response> {
        logger.debug(className + '.get');
        try {

            let where: any = {}

            const createdGte = req.query.createdGte;
            if (createdGte) {
                where = {
                    ...where,
                    created: {
                        gte: new Date(createdGte as string),
                    },
                }
            }

            const createdLte = req.query.createdLte;
            if (createdLte) {
                where = {
                    ...where,
                    created: {
                        lte: new Date(createdLte as string),
                    },
                }
            }

            const logs = await prisma.log.findMany({
                where,
                include: {
                    initiator: true,
                    account: true,
                    group: true,
                    router: true,
                    vpn: true,
                    user: true,
                    department: true,
                },
                orderBy: {
                    id: 'desc',
                },
                // take: 100,
            });

            return res.status(200).json(logs);

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
