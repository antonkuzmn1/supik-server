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
import {prisma} from "../../prisma";

const className = 'DbVpnRepository'

export class DbVpnRepository {
    constructor() {
        logger.debug(className);
    }

    findUnique = async (id: number): Promise<any> => {
        logger.debug(className + '.findUnique');
        return prisma.vpn.findUnique({
            where: {
                id,
            },
            include: {
                router: true,
                user: true,
            },
        });
    }

    findMany = async (where: any): Promise<any> => {
        logger.debug(className + '.findMany');
        return prisma.vpn.findMany({
            where,
            include: {
                router: true,
                user: true,
            },
        });
    }

    create = async (
        data: {
            name: string,
            password: string,
            profile: string,
            remoteAddress: string,
            service: string,
            disabled: 0 | 1,
            title: string,
            vpnId: string,
            routerId: number,
            userId: number,
        }
    ): Promise<any> => {
        logger.debug(className + '.create');
        return prisma.vpn.create({
            data: data,
            include: {
                router: true,
                user: true,
            },
        });
    }

    update = async (
        data: {
            id: number,
            name: string,
            password: string,
            profile: string,
            remoteAddress: string,
            service: string,
            disabled: 0 | 1,
            title: string,
            vpnId: string,
            routerId: number,
            userId: number | null,
        }
    ): Promise<any> => {
        logger.debug(className + '.update');
        return prisma.vpn.update({
            where: {
                id: data.id,
            },
            data: data,
            include: {
                router: true,
                user: true,
            },
        });
    }

    delete = async (id: number): Promise<any> => {
        logger.debug(className + '.delete');
        return prisma.vpn.update({
            where: {
                id
            },
            data: {
                deleted: 1,
            },
            include: {
                router: true,
                user: true,
            },
        });
    }
}
