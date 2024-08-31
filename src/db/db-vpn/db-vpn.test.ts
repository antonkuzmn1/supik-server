import express from "express";
import {router} from "../../router";
import request from "supertest";
import {prisma} from "../../prisma";
import {Account, Router} from "@prisma/client";

const app = express();
app.use(express.json());
app.use('/api', router);

const random: number = Math.floor(Math.random() * 100 * 100 * 100 * 100);

const host = process.env.TEST_ROUTER_HOST as string;
const user = process.env.TEST_ROUTER_USER as string;
const password = process.env.TEST_ROUTER_PASSWORD as string;
const remoteAddress = process.env.TEST_ROUTER_REMOTE_ADDRESS as string;

describe('db-vpn', () => {
    test('e2e', async () => {

        // get root account
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

        // create router
        const responseWithRouter = await request(app)
            .post('/api/db/router')
            .set(headers)
            .send({
                localAddress: host,
                login: user,
                password: password,
            })
            .expect('Content-Type', /json/)
            .expect(200)
        expect(responseWithRouter.body.login).toBe(user);
        const router: Router = responseWithRouter.body;

        const responseWithVpn = await request(app)
            .post('/api/db/vpn')
            .set(headers)
            .send({
                routerId: router.id,
                name: `test_${random.toString()}`,
                password: `test_${random.toString()}`,
                profile: 'default',
                remoteAddress: remoteAddress,
            })
            .expect('Content-Type', /json/)
            .expect(200)
        expect(responseWithVpn.body.name).toBe(`test_${random.toString()}`);
        const vpn = responseWithVpn.body;

        // find all
        const responseWithAllVpns = await request(app)
            .get('/api/db/vpn')
            .set(headers)
            .expect('Content-Type', /json/)
            .expect(200)
        expect(responseWithAllVpns.body.length).toBeGreaterThan(1);

        // find test entity
        const responseWithVpnById = await request(app)
            .get('/api/db/vpn')
            .query({
                id: vpn.id,
                routerId: router.id
            })
            .set(headers)
            .expect('Content-Type', /json/)
            .expect(200)
        expect(responseWithVpnById.body.name).toBe(vpn.name);

        // update test entity
        const response5 = await request(app)
            .put('/api/db/vpn')
            .set(headers)
            .send({
                id: vpn.id,
                routerId: router.id,
                title: random.toString(),
                name: `test_updated_${random.toString()}`,
            })
            .expect('Content-Type', /json/)
            .expect(200)
        expect(response5.body.name).toBe(`test_updated_${random.toString()}`);
        expect(response5.body.title).toBe(random.toString());

        // delete test entity
        const response8 = await request(app)
            .delete('/api/db/vpn')
            .set(headers)
            .send({
                id: vpn.id,
                routerId: router.id,
            })
            .expect('Content-Type', /json/)
            .expect(200)
        expect(response8.body.deleted).toBe(1);
    });

});
