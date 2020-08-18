import db from "../database/connection";
import {Request, Response} from 'express';

export default class ItemsController {
    async index(request: Request, response: Response) {
        const items = await db('items').select('*');
        const serializedItems = items.map(item => ({
            title: item.title,
            image_url: `http://192.168.0.10:3333/static/${item.image}`,
            id: item.id
        }))
        return response.json(serializedItems);
    }
}
