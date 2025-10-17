// Vercel catch-all serverless function mapping to the Express app
const app = require('../app');

module.exports = (req, res) => {
  return app(req, res);
};
