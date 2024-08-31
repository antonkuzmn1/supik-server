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
import {router} from "../router";
import request from "supertest";
import {prisma} from "../prisma";
import {Account} from "@prisma/client";

const app = express();
app.use(express.json());
app.use('/api', router);

describe('security', () => {
    test('e2e', async () => {

        // get security-account
        const root = (await prisma.account.findUnique({
            where: {
                id: 1
            },
        })) as Account;
        expect(root).toBeDefined();

        // get token by credentials
        const response = await request(app)
            .post('/api/security')
            .send({
                username: 'root',
                password: 'root',
            })
            .expect('Content-Type', /json/)
            .expect(200);
        expect(response.body.token).toBeDefined();
        expect(response.body.account.id).toBe(1);
        const token = response.body.token;
        const headers = {'Authorization': `Bearer ${token}`}

        // get security-account by token
        const response2 = await request(app)
            .get('/api/security')
            .set(headers)
            .expect('Content-Type', /json/)
            .expect(200)
        expect(response2.body).toBeDefined();
        expect(response2.body.id).toBe(1);

    });

});
