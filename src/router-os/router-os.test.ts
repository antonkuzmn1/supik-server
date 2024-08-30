import express from "express";
import request from "supertest";
import {Account} from "@prisma/client";
import {router} from "../router";
import { prisma } from "../prisma";

const app = express();
app.use(express.json());
app.use('/api', router);

// const random: number = Math.floor(Math.random() * 100 * 100 * 100 * 100);

const host = process.env.TEST_ROUTER_HOST as string;
const user = process.env.TEST_ROUTER_USER as string;
const password = process.env.TEST_ROUTER_PASSWORD as string;
const idString = '*4';

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

        // // create test entity
        // const responseWithNewEntity = await request(app)
        //     .post('/api/db/router')
        //     .set(headers)
        //     .send({
        //         login: random.toString(),
        //     })
        //     .expect('Content-Type', /json/)
        //     .expect(200)
        // expect(responseWithNewEntity.body.login).toBe(random.toString());
        // const router: Router = responseWithNewEntity.body;

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
        console.log(response4.body);

        // // update test entity
        // const response5 = await request(app)
        //     .put('/api/db/router')
        //     .set(headers)
        //     .send({
        //         id: router.id,
        //         title: random.toString(),
        //     })
        //     .expect('Content-Type', /json/)
        //     .expect(200)
        // expect(response5.body.title).toBe(random.toString());
        //
        // // delete test entity
        // const response8 = await request(app)
        //     .delete('/api/db/router')
        //     .set(headers)
        //     .send({
        //         id: router.id,
        //     })
        //     .expect('Content-Type', /json/)
        //     .expect(200)
        // expect(response8.body.deleted).toBe(1);

    });

});
