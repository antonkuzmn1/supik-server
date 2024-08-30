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

            const passwordIsValid = await bcrypt.compare(password, account.password);
            if (!passwordIsValid) {
                logger.error('Passwords do not match');
                return res.status(403).send('Passwords do not match');
            }

            const token = jwt.sign({id: account.id}, JWT_SECRET, {expiresIn: process.env.TOKEN_LIFETIME});

            return res.status(200).json({token: token, account: account});

        } catch (error) {
            console.error(error);
            logger.error('Internal Server Error');
            return res.status(500).send('Internal Server Error');
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

        } catch (error) {
            console.error(error);
            logger.error('Internal Server Error');
            return res.status(500).send('Internal Server Error');
        }
    }

}
