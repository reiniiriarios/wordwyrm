const valid = ["prod", "dev", "screenshot", "test"];
const ENV = process.env.WYRM_ENV;
if (!valid.includes(ENV)) {
  ENV = "prod";
}

module.exports = ENV;
