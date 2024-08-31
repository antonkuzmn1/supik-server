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

import express from "express";
import {router} from "../../router";
import request from "supertest";
import {prisma} from "../../prisma";
import {Account, Group} from "@prisma/client";

const app = express();
app.use(express.json());
app.use('/api', router);

const random: number = Math.floor(Math.random() * 100 * 100 * 100 * 100);

describe('security-account-group', () => {
    test('e2e', async () => {

        // get security-account
        const root = (await prisma.account.findUnique({
            where: {
                id: 1
            },
        })) as Account;
        expect(root).toBeDefined();

        // get token by credentials
        const responseWithToken = await request(app)
            .post('/api/security')
            .send({
                username: 'root',
                password: 'root',
            })
            .expect('Content-Type', /json/)
            .expect(200);
        expect(responseWithToken.body.token).toBeDefined();
        expect(responseWithToken.body.account.id).toBe(1);
        const token = responseWithToken.body.token;
        const headers = {'Authorization': `Bearer ${token}`}

        // create test entity security-account
        const responseWithAccount = await request(app)
            .post('/api/security/account')
            .set(headers)
            .send({
                username: random.toString(),
                password: random.toString(),
                fullname: random.toString(),
            })
            .expect('Content-Type', /json/)
            .expect(200)
        expect(responseWithAccount.body.username).toBe(random.toString());
        const account: Account = responseWithAccount.body;

        // create test entity security-group
        const responseWithGroup = await request(app)
            .post('/api/security/group')
            .set(headers)
            .send({
                name: random.toString(),
            })
            .expect('Content-Type', /json/)
            .expect(200)
        expect(responseWithGroup.body.name).toBe(random.toString());
        const group: Group = responseWithGroup.body;

        // create new m2m relation
        const responseWithRelation = await request(app)
            .post('/api/security/account-group')
            .set(headers)
            .send({
                accountId: account.id,
                groupId: group.id,
            })
            .expect('Content-Type', /json/)
            .expect(200)
        expect(responseWithRelation.body.accountId).toBe(account.id);

        // delete m2m relation
        await request(app)
            .delete('/api/security/account-group')
            .set(headers)
            .send({
                accountId: account.id,
                groupId: group.id,
            })
            .expect('Content-Type', /json/)
            .expect(200)

        // delete test entity security-account
        const responseWithDeletedAccount = await request(app)
            .delete('/api/security/account')
            .set(headers)
            .send({
                id: account.id,
            })
            .expect('Content-Type', /json/)
            .expect(200)
        expect(responseWithDeletedAccount.body.deleted).toBe(1);

        // delete test entity security-group
        const responseWithDeletedGroup = await request(app)
            .delete('/api/security/group')
            .set(headers)
            .send({
                id: group.id,
            })
            .expect('Content-Type', /json/)
            .expect(200)
        expect(responseWithDeletedGroup.body.deleted).toBe(1);
    });

});
