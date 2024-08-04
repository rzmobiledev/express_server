import { Response, Request } from "express";
import * as utils from '../utils/utils';
import { JWTType, ArticleFieldNoIdNoRoType } from "../utils/type";
const Article = require('../models').Article;
const Tag = require('../models').Tag;



module.exports = {

    async getAllArticles(req: Request, res: Response){
        const error = new utils.ErrResHandler(res);
        let limit = 10;
        const pagination = new utils.Pagination(limit, req)
        try{
            const articles = await Article.findAndCountAll({
                offset: pagination.getOffset(),
                limit: pagination.getLimit(),
                order: [["createdAt", "DESC"]]
            });
            await utils.redis.set(`articles?page=${pagination.getPage()}`, JSON.stringify(articles), 'EX', 1800); 
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
            await utils.redis.set(`articles/${articleId}`, JSON.stringify(article));
            return res.status(200).json(article);

        }catch(err){
            return error.get_globalError(err)
        }
    },

    async createNewArticle(req: Request, res: Response){
        const error = new utils.ErrResHandler(res);
        const success = new utils.ArticleSuccessResHandler(res);
        const bodyParams = new utils.ArticlesBodyParams(req);
        const userAccess: JWTType = res.locals?.auth;
        const channel = 'articleCreated'
        bodyParams.setUserId(userAccess.id!)
        
        try{
            if(!bodyParams.getCategoryId()) return error.get_404_categoryNotFound();
            await utils.createChannelBroker(channel, bodyParams);
            await utils.consumeBroker(channel, utils.createArticle);
            return success.get_201_articleCreated();

        }catch(err){
            return error.get_globalError(err);
        }
    },

    async updateArticle(req: Request, res: Response){
        const error = new utils.ErrResHandler(res);
        const bodyParams = new utils.ArticlesBodyParams(req);
        const articleId = req.params.id;
        const channel = 'articleUpdated'
        try{
            if(!bodyParams.getCategoryId()) return error.get_404_categoryNotFound();
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
            
            await utils.createChannelBroker(channel, bodyParams);
            await utils.consumeBroker(channel, utils.updateArticle)
            
            const response = new utils.ArticlesObjectResponse(req, tagObjectsWithID, articleTagsToJson);
            utils.redis.del(`articles/${articleId}`);
            return res.status(200).json(response.json())

        }catch(err){
            return error.get_globalError(err);
        }
    },

    async deleteArticle(req: Request, res: Response){
        const error = new utils.ErrResHandler(res);
        const success = new utils.ArticleSuccessResHandler(res);
        const articleId = Number(req.params.id)
        const channel = 'articleDeleted'

        try{
            const brokerData = { id: articleId}
            await utils.createChannelBroker(channel, brokerData);
            await utils.consumeBroker(channel, utils.deleteArticle)
            return success.get_200_articleDeleted();
            
        }catch(err){
            return error.get_globalError(err);
        }
    }
}