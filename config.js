var config = {
  powerbi: {
    username: "powerbi@tenant.com",
    password: "password",
    clientId: "00000000-0000-0000-0000-000000000000",
    apiUrl: "https://api.powerbi.com/",
    authorityUrl: "https://login.windows.net/common/oauth2/authorize/",
    resourceUrl: "https://analysis.windows.net/powerbi/api",
    tenant: "tenant.onmicrosoft.com"
  },
  mongodb: {
    username: "admin",
    password: "password",
    hostname: "127.0.0.1",
    port: "27017",
    database: "powerbi_files"
  }
}

module.exports = config;