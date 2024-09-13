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

import {logger} from "../../logger";
import {NextFunction, Request, Response} from "express";
import {AccountGroup, Group} from "@prisma/client";

const className = 'DbUserMiddleware';

export class DbUserMiddleware {

    constructor() {
        logger.debug(className);
    }

    accountShouldBeViewer = (req: Request, res: Response, next: NextFunction): any => {
        return this.checkForAccessUsers(req, res, next, 'viewer');
    }

    accountShouldBeEditor = (req: Request, res: Response, next: NextFunction): any => {
        return this.checkForAccessUsers(req, res, next, 'editor');
    }

    private checkForAccessUsers = (req: Request, res: Response, next: NextFunction, level: 'viewer' | 'editor'): any => {
        logger.debug(className + '.checkForAccessUsers');
        try {
            if (req.body.account.admin === 1) {
                return next();
            }

            const accountGroups: AccountGroup[] = (req.body.account as any).accountGroups as AccountGroup[];

            if (accountGroups.length === 0) {
                return res.status(403).send('Access Denied');
            }

            const some = accountGroups.some(accountGroup => {
                const group = (accountGroup as any).group as Group;
                const levelNumber = level === 'viewer' ? 1 : 2;
                return group.accessUsers >= levelNumber;
            });
            if (!some) {
                return res.status(403).send('Access Denied');
            }

            return next();
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
