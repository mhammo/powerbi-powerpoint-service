var config = {
  powerbi: {
    username: process.env.PBI_USERNAME,
    password: process.env.PBI_PASSWORD,
    clientId: process.env.PBI_CLIENTID,
    apiUrl: process.env.PBI_API_URL,
    authorityUrl: process.env.PBI_AUTHORITY_URL,
    resourceUrl: process.env.PBI_RESOURCE_URL,
    tenant: process.env.PBI_TENANT
  },
  mongodb: {
    username: process.env.MONGODB_USER,
    password: process.env.MONGODB_PASSWORD,
    hostname: process.env.MONGODB_HOSTNAME,
    port: process.env.MONGODB_PORT,
    database: process.env.MONGODB_DATABASE
  }
}

module.exports = config;