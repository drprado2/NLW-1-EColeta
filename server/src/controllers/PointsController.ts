import db from "../database/connection";
import {Request, Response} from 'express';

export default class PointsController {
    async create(request: Request, response: Response) {

        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = request.body;

        const trx = await db.transaction();

        const [point_id] = await trx('points').insert({
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            image: 'https://images.unsplash.com/photo-1597349980809-416d8a02d527?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60',
        });

        const pointItems = items.map((item_id: number) => ({
            item_id, point_id
        }));

        await trx('point_items').insert(pointItems);

        trx.commit();

        return response.status(201).json();
    }

    async show(request: Request, response: Response){
        const { id } = request.params;

        const point = await db('points').where('id', id).first();

        if (!point){
            return response.status(400).json({message: 'Point not found.'});
        }

        const items = await db('items')
            .join('point_items', 'items.id', '=', 'point_items.item_id')
            .where('point_items.point_id', id);

        return response.json({point, items});
    }

    async index(request: Request, response: Response) {
        console.log(request.query);

        const {
            city,
            uf,
            items
        } = request.query;

        const points = await db('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', items as Array<string>)
            .where('city', 'like', `%${String(city)}%`)
            .where('uf', 'like', `%${uf}%`)
            .distinct()
            .select('points.*');

        return response.json(points);
    }
}
