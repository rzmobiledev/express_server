import { Response, Request } from "express";
import * as utils from '../utils/utils';
import { JWTType } from "../utils/type";
import { ChannelName, RedisName } from "../utils/enum";
const Article = require('../models').Article;
const Tag = require('../models').Tag;



module.exports = {

    async getAllArticles(req: Request, res: Response){
        const error = new utils.ErrResHandler(res);
        try{
            const articles = await Article.findAll({
                include: [{
                    model: Tag,
                    as: 'tags',
                }]
            });
            for(const article of articles){
                await utils.redis.lpush(RedisName.ARTICLES, JSON.stringify(article))
            }
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
            await utils.redis.lpush(RedisName.ARTICLES, JSON.stringify(article));
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
        bodyParams.setUserId(userAccess.id!)
        
        try{
            if(!bodyParams.getCategoryId()) return error.get_404_categoryNotFound();

            const isCategoryExists = await utils.isCategoryExists(bodyParams.getCategoryId());
            if(!isCategoryExists) return error.get_404_categoryNotFound(); 
            await utils.createChannelBroker(ChannelName.ARTICLE_CREATED, bodyParams);
            await utils.consumeBroker(ChannelName.ARTICLE_CREATED, utils.createArticle);
            return success.get_201_articleCreated();

        }catch(err){
            return error.get_globalError(err);
        }
    },

    async updateArticle(req: Request, res: Response){
        const error = new utils.ErrResHandler(res);
        const bodyParams = new utils.ArticlesBodyParams(req);
        
        try{
            if(!bodyParams.getCategoryId()) return error.get_404_categoryNotFound();
            const article = await Article.findByPk(bodyParams.getId(), { attributes: ['id']});
            
            if(!article) return error.get_404_articleNotFound();
            const articleTagsObject = JSON.stringify(article?.tags);
            const articleTagsToJson = articleTagsObject ? JSON.parse(articleTagsObject) : [];
            const tagObjectsWithID = utils.assignIdToTagsObject(articleTagsToJson, bodyParams);
            
            await utils.createChannelBroker(ChannelName.ARTICLE_UPDATED, bodyParams);
            await utils.consumeBroker(ChannelName.ARTICLE_UPDATED, utils.updateArticle)
            
            const response = new utils.ArticlesObjectResponse(req, tagObjectsWithID, articleTagsToJson);
            return res.status(200).json(response.json())

        }catch(err){
            return error.get_globalError(err);
        }
    },

    async deleteArticle(req: Request, res: Response){
        const error = new utils.ErrResHandler(res);
        const success = new utils.ArticleSuccessResHandler(res);
        const articleId = Number(req.params.id)

        try{
            const brokerData = { id: articleId}
            await utils.createChannelBroker(ChannelName.ARTICLE_DELETED, brokerData);
            await utils.consumeBroker(ChannelName.ARTICLE_DELETED, utils.deleteArticle)
            return success.get_200_articleDeleted();
            
        }catch(err){
            return error.get_globalError(err);
        }
    }
}