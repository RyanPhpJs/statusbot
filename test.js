require("dotenv").config();
const {APIClient} = require("./api");

const api = new APIClient({ 
    endpoint: "https://turbo-robot-6w6qwwqj779fw4j-4000.app.github.dev",
    token: process.env.APP_TOKEN
});

(async()=>{
    const res = await api.sendError({
        data: "error test",
        cluster_id: 1,
        resumed: "Syntax Error: expected x and receive y"
    })
    // const res = await api.sendOnline({
    //     avatar_url: "https://cdn-icons-png.flaticon.com/512/4712/4712109.png",
    //     name: "StarsTest",
    //     cluster_id: 1,
    //     country: "Brazilzão",
    //     provider: "PC de batata",
    // });
    console.log(res.status, res.data)
})();