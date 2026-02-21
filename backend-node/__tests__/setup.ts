import mongoose from 'mongoose';
import { config } from '../src/config';

beforeAll(async () => {
  await mongoose.connect(config.mongo.uri);
}, 20000);

afterAll(async () => {
  await mongoose.connection.close();
});