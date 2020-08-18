import express from 'express';
import routes from "./routes";
import cors from 'cors';
import * as path from "path";

const app = express();

app.use(express.json());
app.use(cors());
app.use(routes);
app.use('/static', express.static(path.resolve(__dirname, '..', 'assets/images')));

app.listen(3333);
