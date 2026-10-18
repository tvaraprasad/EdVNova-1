const { createProxyMiddleware } = require('http-proxy-middleware');

// Dev-only private staging bridge: /staging/api/* -> staging backend, only with the staging access cookie.
module.exports = function (app) {
    const key = process.env.STAGING_ACCESS_KEY;
    if (!key) return;
    const proxy = createProxyMiddleware({ target: 'http://127.0.0.1:8002', changeOrigin: true, pathRewrite: { '^/staging': '' } });
    app.use('/staging/api', (req, res, next) => {
        const cookie = req.headers.cookie || '';
        if (!cookie.split(';').some(c => c.trim() === `edv_staging=${key}`)) {
            res.statusCode = 403;
            return res.end('Staging access denied');
        }
        return proxy(req, res, next);
    });
};
