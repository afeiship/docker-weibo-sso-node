const fs = require('fs');
const Koa = require('koa');
const app = new Koa();
const koaJson = require('koa-json');
const weiboSso = require('weibo-sso-node');
const secretJson = require('./secret.json');
const tokenJar = require('./.token.json');
const MAX_CACHE_TIME = 3 * 86400000;


//middleware:
app.use(koaJson());
app.use(async ctx => {
    const updateTs = new Date(tokenJar.updated_at) * 1;
    const nowTs = Date.now();

    //> MAX_CACHE_TIME, update cache:
    if ((nowTs - updateTs) > MAX_CACHE_TIME) {
        const token = await weiboSso(secretJson);
        tokenJar.updated_at = (new Date()).toISOString();
        tokenJar.token = token;
        fs.writeFileSync('./.token.json', JSON.stringify(tokenJar));
    }

    ctx.body = tokenJar;
});

app.listen(3002);