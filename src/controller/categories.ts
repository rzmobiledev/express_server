import {request, Request, Response} from 'express';
import * as utils from '../utils/utils';

const Category = require('../models').Category;
import { SuccessMsgEnum } from '../utils/enum';

module.exports = {

    async getAllCategories(req: Request, res: Response){
        const error = new utils.ErrResHandler(res);

        try{
            const category = await Category.findAll({
                include:[],
                order: [
                    ['createdAt', 'DESC']
                ]
            });
            return res.status(201).json(category);

        }catch(err){
            return error.get_globalError(err);
        }
    },  

    async createCategory(req: Request, res: Response){
        const error = new utils.ErrResHandler(res);
        const categName = req.body.name;

        try{
            if(!categName) return error.get_400_fieldNotEmpty();

            const category = await Category.create({
                name: categName
            })

            return res.status(201).json(category);

        }catch(err){
            return error.get_globalError(err);
        }
    },

    async getCategById(req: Request, res: Response){
        const error = new utils.ErrResHandler(res);
        const categId = req.params.id;

        try{
            const category = await Category.findByPk(categId);
            if(!category) return error.get_404_categoryNotFound();

            return res.status(200).json(category);

        }catch(err){
            return error.get_globalError(err);
        }
    },

    async updateCategory(req: Request, res: Response){
        const error = new utils.ErrResHandler(res);
        const categId = req.params.id;
        const categName = req.body.name;

        try{
            const category = await Category.findByPk(categId);
            if(!category) return error.get_404_categoryNotFound();

            await category.update({ name: categName});
            return res.status(200).json(category);

        }catch(err){
            return error.get_globalError(err);
        }
    },

    async deleteCategory(req: Request, res: Response){
        const error = new utils.ErrResHandler(res);
        const categId = req.params.id;
        try{

            const category = await Category.destroy({
                where: {id: categId}
            });
            
            if(!category) return error.get_404_categoryNotFound();

            return res.status(200).json({message: SuccessMsgEnum.CATEGORY_DELETED});
        }catch(err){
            return error.get_globalError(err);
        }
    }
}