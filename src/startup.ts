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

import {prisma} from "./prisma";
import {logger} from "./logger";
import bcrypt from "bcrypt";
import {NextFunction} from "express";

export const startup = async () => {
    await createAccountIfNotExists();
    await createSettingsIfNotExists();
}

const createAccountIfNotExists = async () => {
    const account = await prisma.account.findUnique({
        where: {
            id: 1,
            username: 'root'
        },
    });
    if (!account) {
        const admin: 0 | 1 = 1;
        const username: string = 'root';
        const password: string = await bcrypt.hash('root', 10);
        await prisma.account.create({
            data: {
                username,
                password,
                admin,
            },
        });
        logger.info('Root has been created');
    }
}

const settingsParams = [
    'tokenLifetime',
    'mailYandexToken',
    'mailYandexOrgId',
    'mailYandexDomain',
    'mailYandexTransporterHost',
    'mailYandexTransporterPort',
    'mailYandexTransporterSecure',
    'mailYandexTransporterAuthUser',
    'mailYandexTransporterAuthPass',
    'routerDefaultPort',
    'routerDefaultTimeout',
    'dnsServerAddress',
    'localDomain',
]

const createSettingsIfNotExists = async () => {
    return new Promise<void>(resolve => {
        settingsParams.forEach(param => {
            prisma.settings.findUnique({where: {key: param}}).then((setting) => {
                if (!setting) {
                    prisma.settings.create({data: {key: param}}).then((_result) => {
                        logger.info(`Setting param ${param} has been created`);
                        resolve();
                    })
                }
            });
        })
    });
}
