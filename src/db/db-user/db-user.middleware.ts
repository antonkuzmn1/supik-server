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
                return res.status(403).send('User is not editor');
            }

            accountGroups.some(accountGroup => {
                const group = (accountGroup as any).group as Group;
                const levelNumber = level === 'viewer' ? 1 : 0;
                return group.accessUsers >= levelNumber;
            });

            return next();
        } catch (error) {
            console.error(error);
            logger.error('Internal Server Error');
            return res.status(500).send('Internal Server Error');
        }
    }

}
