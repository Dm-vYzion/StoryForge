"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../src/app");
describe('Auth routes', () => {
    it('logs in with valid credentials and returns user + token', async () => {
        const res = await (0, supertest_1.default)(app_1.app)
            .post('/api/auth/login')
            .send({
            email: 'author@example.com',
            password: 'dev-only-placeholder',
        });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('user');
        expect(res.body.data).toHaveProperty('token');
        expect(res.headers['set-cookie']).toBeDefined();
    }, 10000);
    it('rejects invalid credentials', async () => {
        const res = await (0, supertest_1.default)(app_1.app)
            .post('/api/auth/login')
            .send({
            email: 'author@example.com',
            password: 'definitely-wrong-password',
        });
        // Adjust if your route uses a different code
        expect([400, 401]).toContain(res.status);
        expect(res.body).toHaveProperty('success', false);
    });
    it('returns current user from /api/auth/me when authenticated', async () => {
        // First, log in to get cookie
        const loginRes = await (0, supertest_1.default)(app_1.app)
            .post('/api/auth/login')
            .send({
            email: 'author@example.com',
            password: 'dev-only-placeholder',
        });
        const cookies = loginRes.headers['set-cookie'];
        expect(cookies).toBeDefined();
        // Then call /api/auth/me with cookie
        const meRes = await (0, supertest_1.default)(app_1.app)
            .get('/api/auth/me')
            .set('Cookie', cookies);
        expect(meRes.status).toBe(200);
        expect(meRes.body).toHaveProperty('success', true);
        expect(meRes.body).toHaveProperty('data');
        expect(meRes.body.data.user).toHaveProperty('email', 'author@example.com');
    }, 10000);
    it('rejects /api/auth/me without authentication', async () => {
        const res = await (0, supertest_1.default)(app_1.app).get('/api/auth/me');
        // Adjust if you use 403 instead
        expect([401, 403]).toContain(res.status);
        expect(res.body).toHaveProperty('success', false);
    });
    it('logs out and clears the auth cookie', async () => {
        const loginRes = await (0, supertest_1.default)(app_1.app)
            .post('/api/auth/login')
            .send({
            email: 'author@example.com',
            password: 'dev-only-placeholder',
        });
        const cookies = loginRes.headers['set-cookie'];
        expect(cookies).toBeDefined();
        const logoutRes = await (0, supertest_1.default)(app_1.app)
            .post('/api/auth/logout')
            .set('Cookie', cookies);
        expect([200, 204]).toContain(logoutRes.status);
        if (logoutRes.body && Object.keys(logoutRes.body).length > 0) {
            expect(logoutRes.body).toHaveProperty('success', true);
        }
        const logoutSetCookie = logoutRes.headers['set-cookie'] || [];
        const serialized = logoutSetCookie.join('; ').toLowerCase();
        expect(serialized).toContain('token='); // cookie name is "token"
        expect(serialized).toContain('expires='); // cleared with an expiry
    }, 10000);
    it('cannot access /api/auth/me after logout when cookie is cleared (realistic client)', async () => {
        const loginRes = await (0, supertest_1.default)(app_1.app)
            .post('/api/auth/login')
            .send({
            email: 'author@example.com',
            password: 'dev-only-placeholder',
        });
        const cookies = loginRes.headers['set-cookie'];
        expect(cookies).toBeDefined();
        // Logout: server sends Set-Cookie to clear 'token'
        const logoutRes = await (0, supertest_1.default)(app_1.app)
            .post('/api/auth/logout')
            .set('Cookie', cookies);
        expect([200, 204]).toContain(logoutRes.status);
        // Simulate browser honoring logout and not sending the token cookie anymore
        const meRes = await (0, supertest_1.default)(app_1.app).get('/api/auth/me');
        expect(meRes.status).toBe(401);
        expect(meRes.body).toHaveProperty('success', false);
        expect(meRes.body).toHaveProperty('error', 'Authentication required');
    }, 10000);
    it('returns a user object with expected shape from /api/auth/me', async () => {
        const loginRes = await (0, supertest_1.default)(app_1.app)
            .post('/api/auth/login')
            .send({
            email: 'author@example.com',
            password: 'dev-only-placeholder',
        });
        const cookies = loginRes.headers['set-cookie'];
        expect(cookies).toBeDefined();
        const meRes = await (0, supertest_1.default)(app_1.app)
            .get('/api/auth/me')
            .set('Cookie', cookies);
        expect(meRes.status).toBe(200);
        expect(meRes.body).toHaveProperty('success', true);
        expect(meRes.body).toHaveProperty('data');
        expect(meRes.body.data).toHaveProperty('user');
        const user = meRes.body.data.user;
        expect(typeof user.id).toBe('string');
        expect(typeof user.email).toBe('string');
        expect(typeof user.displayName).toBe('string');
        expect(typeof user.plan).toBe('string');
        expect(typeof user.aiUsageThisPeriod).toBe('number');
        expect(user).toHaveProperty('createdAt');
        // Make sure we don’t accidentally return passwordHash
        expect(user).not.toHaveProperty('passwordHash');
    }, 10000);
});
//# sourceMappingURL=auth.test.js.map