// Vercel Serverless Function entry point that proxies to the Express app
const app = require('../app');

module.exports = (req, res) => {
  return app(req, res);
};
