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
        } catch (error) {
            console.error(error);
            logger.error('Internal Server Error');
            return res.status(500).send('Internal Server Error');
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
        } catch (error) {
            console.error(error);
            logger.error('Internal Server Error');
            return res.status(500).send('Internal Server Error');
        }
    }
}
