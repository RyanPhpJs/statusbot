module.exports = class Controller {

    /**
     * 
     * @param {import("./Client")} client 
     */
    constructor(client){
        this.client = client;
        this.json = require("express").json({ limit: "5mb", type: (e) => true });
    }

    /**
     * @type {import("./RequestBuilder").RequestBuilder}
     */
    request(options, callback){
        const bodyKeys = Object.keys(Object.assign({}, options.body));
        const lengthOptions = bodyKeys.length;
        this.client.app[(options.method || "GET").toLowerCase()](options.url, (req, res, next) => {
            if(options.auth){
                if(!req.headers.authorization || req.headers.authorization !== "Bearer " + this.client.token){
                    return res.status(401).send({
                        message: "Invalid Token"
                    });
                }
            }
            if(lengthOptions > 0){
                this.json(req, res, next);
                return;
            }
            return next();
        }, (req, res, next) => {
            if(lengthOptions > 0){
                for(const k of bodyKeys){
                    if(req.body[k] === null || req.body[k] === undefined){
                        if(options.body[k].required){
                            return res.status(400).send({ message: "Invalid request, required body items"});
                        }
                        req.body[k] = null;
                        continue;
                    }
                    if(options.body[k].type === "string"){
                        if(typeof req.body[k] !== "string"){
                            return res.status(400).send({ message: "Invalid request, variable types not match"})
                        }
                    }
                    if(options.body[k].type === "number"){
                        if(typeof req.body[k] !== "number"){
                            return res.status(400).send({ message: "Invalid request, variable types not match"})
                        }
                    }
                    if(options.body[k].type === "boolean"){
                        if(typeof req.body[k] !== "boolean"){
                            return res.status(400).send({ message: "Invalid request, variable types not match"})
                        }
                    }
                }
            }
            next();
        }, callback)
    }

}