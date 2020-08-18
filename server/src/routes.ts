import express, {response} from 'express';
import db from "./database/connection";
import PointsController from "./controllers/PointsController";
import ItemsController from "./controllers/ItemsController";

const routes = express.Router();

const pointsController = new PointsController();
const itemsController = new ItemsController();

routes.get('/users', (request, response) => {
    const users = [{name: 'Adriano', age: 26}, {name: 'Renata', age: 25}];
    return response.json(users);
});

routes.post('/users/:id', (request, response) => {
    // Recupera o body
    console.log(request.body);
    // recupera os parâmetros da rota
    console.log(request.params);
    // recupera os parâmetros de query string
    console.log(request.query);

    return response.json(request.body);
});

routes.get('/items', itemsController.index);
routes.post('/points', pointsController.create);
routes.get('/points', pointsController.index);
routes.get('/points/:id', pointsController.show);

export default routes;
