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
import request from "supertest";
import {Account} from "@prisma/client";
import {router} from "../router";
import { prisma } from "../prisma";

const app = express();
app.use(express.json());
app.use('/api', router);

const random: number = Math.floor(Math.random() * 100 * 100 * 100 * 100);

const host = process.env.TEST_ROUTER_HOST as string;
const user = process.env.TEST_ROUTER_USER as string;
const password = process.env.TEST_ROUTER_PASSWORD as string;
const remoteAddress = process.env.TEST_ROUTER_REMOTE_ADDRESS as string;

describe('router-os', () => {
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
            .post('/api/router-os')
            .set(headers)
            .query({
                host,
                user,
                password,
            })
            .send({
                name: 'test_' + random.toString(),
                password: 'test_' + random.toString(),
                profile: 'default',
                remoteAddress: remoteAddress,
            })
            .expect('Content-Type', /json/)
            .expect(200)
        expect(responseWithNewEntity.body.name).toBe('test_' + random.toString());
        const idString: string = responseWithNewEntity.body['.id'];
        console.log(responseWithNewEntity.body);

        // find all
        const response3 = await request(app)
            .get('/api/router-os')
            .set(headers)
            .query({
                host,
                user,
                password,
            })
            .expect('Content-Type', /json/)
            .expect(200)
        expect(response3.body.length).toBeGreaterThan(1);

        // find test entity
        const response4 = await request(app)
            .get('/api/router-os')
            .query({
                host,
                user,
                password,
                idString,
            })
            .set(headers)
            .expect('Content-Type', /json/)
            .expect(200)
        expect(response4.body).toBeDefined();

        // update test entity
        const response5 = await request(app)
            .put('/api/router-os')
            .set(headers)
            .query({
                host,
                user,
                password,
            })
            .send({
                idString,
                name: 'test_updated_' + random.toString(),
            })
            .expect('Content-Type', /json/)
            .expect(200)
        expect(response5.body.name).toBe('test_updated_' + random.toString());

        // delete test entity
        const response8 = await request(app)
            .delete('/api/router-os')
            .set(headers)
            .query({
                host,
                user,
                password,
            })
            .send({
                idString,
            })
            .expect('Content-Type', /json/)
            .expect(200)
        expect(response8.body.length).toBe(0);

    });

});
