import { Response, Request, raw } from "express";

import * as utils from '../utils/utils';
const Article = require('../models').Article;
const Tag = require('../models').Tag;
const ArticleTag = require('../models').ArticleTag;

module.exports = {

    async getAllArticles(req: Request, res: Response){
        const error = new utils.ErrResHandler(res);

        try{

            const articles = await Article.findAll();
            return res.status(200).json(articles);

        }catch(err){
            return error.get_globalError(err)
        }
    },

    async getOneArticle(req: Request, res: Response){
        const error = new utils.ErrResHandler(res);
        const articleId = req.params.id;

        try{

            const article = await Article.findByPk(articleId, {
                include: [{
                    model: Tag,
                    as: 'tags',
                }]
            });
            
            if(!article) return error.get_404_articleNotFound();
            return res.status(200).json(article);

        }catch(err){
            return error.get_globalError(err)
        }
    },

    async createNewArticle(req: Request, res: Response){
        const error = new utils.ErrResHandler(res);
        const bodyParams = new utils.ArticlesBodyParams(req);

        try{
            const article = await Article.create({
                userId: bodyParams.userId,
                title: bodyParams.title,
                subtitle: bodyParams.subtitle,
                description: bodyParams.description
            });

            await utils.createArticleTags(bodyParams.tags, article);
            
            const result = await Article.findByPk(article.id, {
                include: [{
                    model: Tag,
                    as: 'tags'
                }]
            })

            return res.status(201).json(result)
        }catch(err){
            return error.get_globalError(err);
        }
    },

    async updateArticle(req: Request, res: Response){
        const error = new utils.ErrResHandler(res);
        const bodyParams = new utils.ArticlesBodyParams(req);
        const articleId = req.params.id;
        
        try{
            const article = await Article.findByPk(articleId, {
                include: [{
                    model: Tag,
                    as: 'tags',
                }]
            });
            
            if(!article) return error.get_404_articleNotFound();

            const articleTagsObject = JSON.stringify(article?.tags);
            const articleTagsToJson = articleTagsObject ? JSON.parse(articleTagsObject) : [];
            const tagObjectsWithID = utils.assignIdToTagsObject(articleTagsToJson, bodyParams);
            // console.log(tagObjectsWithID);
            
            
            await article.update(bodyParams);
            await utils.updateArticleTags(tagObjectsWithID, article);            
            
            const response = new utils.ArticlesObjectResponse(req, tagObjectsWithID, articleTagsToJson);
            return res.status(201).json(response.json())
            // return res.status(201).json(article)

        }catch(err){
            return error.get_globalError(err);
        }
    },

    async deleteArticle(req: Request, res: Response){
        const error = new utils.ErrResHandler(res);
        const success = new utils.ArticleSuccessResHandler(res);
        const articleId = Number(req.params.id)
        
        try{
            
            const article = await Article.findByPk(articleId, {
                include: [{
                    model: Tag,
                    as: 'tags'
                }]
            });
            if(!article) return error.get_404_articleNotFound();

            const articleTagsObject = JSON.stringify(article?.tags);
            const articleTagsToJson = articleTagsObject ? JSON.parse(articleTagsObject) : [];
            const allTagsID = utils.filterOnlyTagsID(articleTagsToJson);
            
            if(allTagsID){
                await article.removeTags(allTagsID)
                await Tag.destroy({
                    where: {id: allTagsID}
                });
            }
            await Article.destroy({
                where: {id: articleId}
            });


             return success.get_200_articleDeleted();
            
        }catch(err){
            return error.get_globalError(err);
        }
    }
}