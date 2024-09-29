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

import {Router, RouterGroupEditor, RouterGroupViewer} from "@prisma/client";
import {logger} from "../../logger";
import {prisma} from "../../prisma";

const className = 'DbRouterRepository'

export interface RouterExtended extends Router {
    routerGroupViewer: RouterGroupViewer[],
    routerGroupEditor: RouterGroupEditor[],
}

export class DbRouterRepository {
    constructor() {
        logger.debug(className);
    }

    findUnique = async (id: number): Promise<RouterExtended | null> => {
        logger.debug(className + '.findUnique');
        return prisma.router.findUnique({
            where: {
                id: id,
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
    }

    findMany = async (where: any): Promise<RouterExtended[]> => {
        logger.debug(className + '.findMany');
        return prisma.router.findMany({
            where,
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
    }

    create = async (data: {
        login: string,
        password: string,
        localAddress: string,
        remoteAddress: string,
        defaultProfile: string,
        name: string,
        title: string,
        disabled: 0 | 1,
        certificate: Buffer | null,
        l2tpKey: string,
    }): Promise<RouterExtended> => {
        logger.debug(className + '.create');
        return prisma.router.create({
            data: data,
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
    }

    update = async (data: {
        id: number,
        login: string,
        password: string,
        localAddress: string,
        remoteAddress: string,
        defaultProfile: string,
        name: string,
        title: string,
        disabled: 0 | 1,
        certificate: Buffer | null,
        l2tpKey: string,
    }): Promise<RouterExtended> => {
        logger.debug(className + '.update');
        if (data.certificate === null) {
            const {certificate, ...withoutCertificate} = data;
            return prisma.router.update({
                where: {id: withoutCertificate.id},
                data: withoutCertificate,
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
        }
        return prisma.router.update({
            where: {id: data.id},
            data: data,
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
    }

    delete = async (id: number): Promise<RouterExtended> => {
        logger.debug(className + '.delete');
        return prisma.router.update({
            where: {
                id,
            },
            data: {
                deleted: 1,
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
    }
}
