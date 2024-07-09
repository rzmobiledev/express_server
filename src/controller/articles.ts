import { Response, Request } from "express";

import * as utils from '../utils/utils';
const Article = require('../models').Article;
const Tag = require('../models').Tag;

module.exports = {

    async createNewArticle(req: Request, res: Response){
        const success = new utils.UserSuccessResHandler(res);
        const error = new utils.ErrResHandler(res);
        const bodyParams = new utils.ArticlesBodyParams(req);
        const isTagExist = bodyParams.tags.length > 0;

        try{
            const article = await Article.create({
                userId: bodyParams.userId,
                title: bodyParams.title,
                subtitle: bodyParams.subtitle,
                description: bodyParams.description
            });



            if(isTagExist){
                
                const tags = await Tag.bulkCreate(bodyParams.tags);
                console.log(tags);
                
                for(let i=0; i < tags.length; i++){
                    await article.addTag(tags[i]);
                }
            }
            
            const result = await Article.findByPk(article.id, {
                include: [{
                    model: Tag,
                    as: 'tags'
                }]
            })

            return res.status(201).json(result)
        }catch(err){
            return res.status(400).send(err);
            // return error.get_globalError(err);
        }
    }
}