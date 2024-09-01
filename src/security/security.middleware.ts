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
import jwt from "jsonwebtoken";
import {prisma} from "../prisma";
import {logger} from "../logger";

export class SecurityMiddleware {
    JWTSecret?: string = process.env.JWT_SECRET;

    constructor() {
        logger.debug("SecurityMiddleware");
    }

    getAccountFromToken = async (req: Request, res: Response, next: NextFunction) => {
        logger.debug("SecurityMiddleware.getUserFromToken");
        try {
            if (!this.JWTSecret) {
                logger.error('JWT_SECRET is undefined');
                return res.status(500).send('JWT_SECRET is undefined');
            }

            const tokenRaw = req.headers.authorization;
            const token = tokenRaw && tokenRaw.startsWith('Bearer ') ? tokenRaw.substring(7) : null;
            if (!token) {
                logger.error('Token is undefined');
                return res.status(403).send('Token is undefined');
            }

            const decodedToken = jwt.verify(token, this.JWTSecret) as any;
            if (!decodedToken || !decodedToken.id || typeof decodedToken.id !== 'number') {
                logger.error('Decoded token is undefined');
                return res.status(403).send('Decoded token is undefined');
            }

            const account = await prisma.account.findUnique({
                where: {
                    id: decodedToken.id,
                    deleted: 0
                },
                include: {
                    accountGroups: {
                        include: {
                            group: true
                        }
                    }
                }
            });
            if (!account) {
                logger.error('User does not exist');
                return res.status(403).send('User does not exist');
            }

            const accountWithGroupIds = {
                ...account,
                groupIds: account.accountGroups.map(userGroup => userGroup.groupId),
            };

            logger.info('User found with userId ' + decodedToken.id);
            req.body.account = accountWithGroupIds;
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

    accountShouldBeAdmin = async (req: Request, res: Response, next: NextFunction) => {
        logger.debug("SecurityMiddleware.userShouldBeAdmin");
        try {
            const account = req.body.account;
            if (!account) {
                logger.error('User is undefined');
                return res.status(403).send('User is undefined');
            }

            if (!account.admin) {
                logger.error('User is not admin');
                return res.status(403).send('User is not admin');
            }

            logger.info("User is admin");
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
