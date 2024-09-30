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

describe('db-mail', () => {

    let token: string;
    let headers: {[p: string]: string} = {};

    beforeAll(async () => {
        const root = (await prisma.account.findUnique({
            where: {
                id: 1
            },
        })) as Account;
        expect(root).toBeDefined();

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
        token = responseWithRootToken.body.token;
        headers = {'Authorization': `Bearer ${token}`}
    })

    test('create', async () => {
        // const createdMail = await request(app)
        //     .post('/api/db/mail')
        //     .set(headers)
        //     .send({
        //         data: {
        //             nickname: `supik_test_user`,
        //             nameFirst: 'supik',
        //             nameLast: 'test',
        //             nameMiddle: 'user',
        //             gender: 'male',
        //             position: 'test_position',
        //             isAdmin: false,
        //             password: 'supik_test_user_password_123',
        //             userId: 0,
        //         }
        //     })
        //     .expect('Content-Type', /json/)
        //     .expect(200)

        // // create router
        // const responseWithRouter = await request(app)
        //     .post('/api/db/router')
        //     .set(headers)
        //     .send({
        //         localAddress: host,
        //         login: user,
        //         password: password,
        //     })
        //     .expect('Content-Type', /json/)
        //     .expect(200)
        // expect(responseWithRouter.body.login).toBe(user);
        // const router: Router = responseWithRouter.body;
        //
        // const responseWithVpn = await request(app)
        //     .post('/api/db/vpn')
        //     .set(headers)
        //     .send({
        //         routerId: router.id,
        //         name: `test_${random.toString()}`,
        //         password: `test_${random.toString()}`,
        //         profile: 'default',
        //         remoteAddress: remoteAddress,
        //     })
        //     .expect('Content-Type', /json/)
        //     .expect(200)
        // expect(responseWithVpn.body.name).toBe(`test_${random.toString()}`);
        // const vpn = responseWithVpn.body;
        //
        // // find all
        // const responseWithAllVpns = await request(app)
        //     .get('/api/db/vpn')
        //     .set(headers)
        //     .expect('Content-Type', /json/)
        //     .expect(200)
        // expect(responseWithAllVpns.body.length).toBeGreaterThan(1);
        //
        // // find test entity
        // const responseWithVpnById = await request(app)
        //     .get('/api/db/vpn')
        //     .query({
        //         id: vpn.id,
        //         routerId: router.id
        //     })
        //     .set(headers)
        //     .expect('Content-Type', /json/)
        //     .expect(200)
        // expect(responseWithVpnById.body.name).toBe(vpn.name);
        //
        // // update test entity
        // const response5 = await request(app)
        //     .put('/api/db/vpn')
        //     .set(headers)
        //     .send({
        //         id: vpn.id,
        //         routerId: router.id,
        //         title: random.toString(),
        //         name: `test_updated_${random.toString()}`,
        //     })
        //     .expect('Content-Type', /json/)
        //     .expect(200)
        // expect(response5.body.name).toBe(`test_updated_${random.toString()}`);
        // expect(response5.body.title).toBe(random.toString());
        //
        // // delete test entity
        // const response8 = await request(app)
        //     .delete('/api/db/vpn')
        //     .set(headers)
        //     .send({
        //         id: vpn.id,
        //         routerId: router.id,
        //     })
        //     .expect('Content-Type', /json/)
        //     .expect(200)
        // expect(response8.body.deleted).toBe(1);
    });

    test('sync', async () => {
        const response = await request(app)
            .get('/api/db/mail/sync/')
            .set(headers)
            // .expect('Content-Type', /json/)
            // .expect(200)
        console.log(response.body);
    });

});
