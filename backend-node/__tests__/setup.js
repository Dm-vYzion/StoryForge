"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../src/config");
beforeAll(async () => {
    await mongoose_1.default.connect(config_1.config.mongo.uri);
}, 20000);
afterAll(async () => {
    await mongoose_1.default.connection.close();
});
//# sourceMappingURL=setup.js.map