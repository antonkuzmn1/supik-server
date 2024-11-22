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

import {logger} from "../logger";
import {Request, Response} from "express";
import {Account} from "@prisma/client";
import {prisma} from "../prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export interface JwtPayload {
    id: number;
}

const JWT_SECRET = process.env.JWT_SECRET

export class SecurityService {
    constructor() {
        logger.debug('SecurityService');
    }

    async getTokenByCredentials(req: Request, res: Response): Promise<Response> {
        logger.debug('SecurityService.getTokenByCredentials');
        try {

            if (!JWT_SECRET) {
                logger.error('JWT_SECRET is undefined');
                return res.status(500).send('JWT_SECRET is undefined');
            }

            const {username, password} = req.body;
            if (!username) {
                logger.error('"username" field required');
                return res.status(400).send('"username" field required');
            }
            if (!password) {
                logger.error('"password" field required');
                return res.status(400).send('"password" field required');
            }

            const account: Account | null = await prisma.account.findUnique({
                where: {
                    username: username,
                    deleted: 0,
                },
                include: {
                    accountGroups: {
                        include: {
                            group: true,
                        },
                    },
                },
            });
            if (!account) {
                logger.error('Account not found');
                return res.status(403).send('Account not found');
            }
            if (account.disabled) {
                logger.error('Account is disabled');
                return res.status(403).send('Account is disabled');
            }

            const passwordIsValid = await bcrypt.compare(password, account.password);
            if (!passwordIsValid) {
                logger.error('Passwords do not match');
                return res.status(403).send('Passwords do not match');
            }

            const tokenLifetime = (await prisma.settings.findUnique({where: {key: 'tokenLifetime'}}))?.value;

            const token = jwt.sign(
                {id: account.id},
                JWT_SECRET,
                {expiresIn: tokenLifetime ? tokenLifetime : '12h'}
            );

            return res.status(200).json({token: token, account: account});

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

    async getAccountByToken(req: Request, res: Response): Promise<Response> {
        logger.debug('SecurityService.getUserByToken');
        try {

            if (!JWT_SECRET) {
                logger.error('JWT_SECRET is undefined');
                return res.status(500).send('JWT_SECRET is undefined');
            }

            const tokenRaw: string | undefined = req.headers.authorization;
            if (!tokenRaw) {
                logger.error('Token is undefined');
                return res.status(403).send('Token is undefined');
            }

            const token: string | null = tokenRaw && tokenRaw.startsWith('Bearer ') ? tokenRaw.substring(7) : null;
            if (!token) {
                logger.error('Token should starts with "Beaver"');
                return res.status(403).send('Token should starts with "Bearer"');
            }

            const decodedToken: JwtPayload = jwt.verify(token, JWT_SECRET) as unknown as JwtPayload;
            if (!decodedToken.id) {
                logger.error('Decoded token is undefined');
                return res.status(403).send('Decoded token is undefined');
            }

            const account: Account | null = await prisma.account.findUnique({
                where: {
                    id: decodedToken.id,
                    deleted: 0
                },
                include: {
                    accountGroups: {
                        include: {
                            group: true,
                        },
                    },
                },
            });
            if (!account) {
                logger.error('Account not found');
                return res.status(403).send('Account not found');
            }

            return res.status(200).json(account);

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
