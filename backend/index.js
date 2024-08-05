import express from 'express';
import dotenv from 'dotenv';
import connectDatabase from './utils/db.js';

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(express.json());

app.listen(port, async () => {
    await connectDatabase();
    console.log(`Server is running at port : ${port}`)
})