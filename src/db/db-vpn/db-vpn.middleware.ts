import {logger} from "../../logger";
import {NextFunction, Request, Response} from "express";
import {AccountGroup, Group} from "@prisma/client";
import {prisma} from "../../prisma";

const className = 'DbVpnMiddleware';

export class DbVpnMiddleware {

    constructor() {
        logger.debug(className);
    }

    accountShouldBeViewer = (req: Request, res: Response, next: NextFunction): any => {
        return this.checkForAccessRouters(req, res, next, 'viewer');
    }

    accountShouldBeEditor = (req: Request, res: Response, next: NextFunction): any => {
        return this.checkForAccessRouters(req, res, next, 'editor');
    }

    private checkForAccessRouters = async (req: Request, res: Response, next: NextFunction, level: 'viewer' | 'editor'): Promise<any> => {
        logger.debug(className + '.checkForAccessRouters');
        try {
            if (req.body.account.admin === 1) {
                return next();
            }

            const groupIds = (req.body.account as any).groupIds;

            if (groupIds.length === 0) {
                return res.status(403).send('User has not a groups');
            }

            const {routerId} = req.body;

            const router = await prisma.router.findUnique({
                where: {
                    id: routerId,
                    deleted: 0,
                },
                include: {
                    routerGroupViewer: {
                        include: {
                            group: true,
                        },
                    },
                    routerGroupEditor: {
                        include: {
                            group: true,
                        },
                    },
                },
            });
            if (!router) {
                return res.status(403).send(`Router with ID:${routerId} not found`);
            }

            if (level === 'viewer') {
                const isViewer = groupIds.some((groupId: number) => {
                    return router.routerGroupViewer.some(routerGroupViewer => {
                        return routerGroupViewer.groupId === groupId;
                    })
                });
                if (!isViewer) {
                    return res.status(403).send('Account is not a viewer');
                }
            } else {
                const isEditor = groupIds.some((groupId: number) => {
                    return router.routerGroupEditor.some(routerGroupEditor => {
                        return routerGroupEditor.groupId === groupId;
                    })
                });
                if (!isEditor) {
                    return res.status(403).send('Account is not an editor');
                }
            }

            return next();
        } catch (error) {
            console.error(error);
            logger.error('Internal Server Error');
            return res.status(500).send('Internal Server Error');
        }
    }

}
