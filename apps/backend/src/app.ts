import express from 'express';
import cors from 'cors';
import routes from './routes/index.js'
import { errorMiddleware } from './middlewares/error.middleware.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/api/v1', routes)

app.use(errorMiddleware)

export default app