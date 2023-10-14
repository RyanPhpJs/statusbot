const { default: axios } = require("axios")

const RequestBuilder = ({ client, url, body={} }) => {
    const bodyKeys = Object.keys(Object.assign({}, body))
    return (args) => {
        for(const k of bodyKeys){
            if(args[k] === null || args[k] === undefined){
                if(body[k].required){
                    throw new Error("Invalid request, required body items")
                }
                args[k] = null;
                continue;
            }
            if(body[k].type === "string"){
                if(typeof args[k] !== "string"){
                    throw new Error("Invalid request, variable types not match")
                }
            }
            if(body[k].type === "number"){
                if(typeof args[k] !== "number"){
                    throw new Error("Invalid request, variable types not match")
                }
            }
            if(body[k].type === "boolean"){
                if(typeof args[k] !== "boolean"){
                    throw new Error("Invalid request, variable types not match")
                }
            }
        }
        return axios.post(client.endpoint + url, args, {
            headers: {
                'Authorization': 'Bearer ' + client.token
            },
            validateStatus: () => true
        })
    }
}

module.exports.APIClient = class APIClient {

    constructor({ endpoint, token }){
        const _private = { endpoint, token }
        this.sendOnline = RequestBuilder({ 
            client: _private,
            url: "/api/send/online",
            body: {
                avatar_url: { type: "string", required: true },
                name: { type: "string", required: true },
                cluster_id: { type: "number", required: true },
                country: { type: "string" },
                provider: { type: "string" },
            }
        });
        this.sendError = RequestBuilder({
            client: _private,
            url: "/api/send/error",
            body: {
                data: { type: "string", required: true },
                cluster_id: { type: "number" },
                resumed: { type: "string" }
            }
        })
    }

}