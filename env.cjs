const valid = ["prod", "dev", "screenshot", "test"];
const ENV = valid.includes(process.env.WYRM_ENV) ? process.env.WYRM_ENV : "prod";

module.exports = ENV;
