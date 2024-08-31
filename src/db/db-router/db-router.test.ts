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
import {Account, Router} from "@prisma/client";

const app = express();
app.use(express.json());
app.use('/api', router);

const random: number = Math.floor(Math.random() * 100 * 100 * 100 * 100);

describe('db-router', () => {
    test('e2e', async () => {

        // get security-account
        const root = (await prisma.account.findUnique({
            where: {
                id: 1
            },
        })) as Account;
        expect(root).toBeDefined();

        // get token by credentials
        const responseWithRootToken = await request(app)
            .post('/api/security')
            .send({
                username: 'root',
                password: 'root',
            })
            .expect('Content-Type', /json/)
            .expect(200);
        expect(responseWithRootToken.body.token).toBeDefined();
        expect(responseWithRootToken.body.account.id).toBe(1);
        const token = responseWithRootToken.body.token;
        const headers = {'Authorization': `Bearer ${token}`}

        // create test entity
        const responseWithNewEntity = await request(app)
            .post('/api/db/router')
            .set(headers)
            .send({
                login: random.toString(),
            })
            .expect('Content-Type', /json/)
            .expect(200)
        expect(responseWithNewEntity.body.login).toBe(random.toString());
        const router: Router = responseWithNewEntity.body;

        // find all
        const response3 = await request(app)
            .get('/api/db/router')
            .set(headers)
            .expect('Content-Type', /json/)
            .expect(200)
        expect(response3.body.length).toBeGreaterThan(1);

        // find test entity
        const response4 = await request(app)
            .get('/api/db/router')
            .query({
                id: router.id,
            })
            .set(headers)
            .expect('Content-Type', /json/)
            .expect(200)
        expect(response4.body.login).toBe(router.login);

        // update test entity
        const response5 = await request(app)
            .put('/api/db/router')
            .set(headers)
            .send({
                id: router.id,
                title: random.toString(),
            })
            .expect('Content-Type', /json/)
            .expect(200)
        expect(response5.body.title).toBe(random.toString());

        // delete test entity
        const response8 = await request(app)
            .delete('/api/db/router')
            .set(headers)
            .send({
                id: router.id,
            })
            .expect('Content-Type', /json/)
            .expect(200)
        expect(response8.body.deleted).toBe(1);

    });

});
