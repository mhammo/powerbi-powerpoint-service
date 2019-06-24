const config = require('../config');
const debug = require('debug')('PROJECT:powerbi');
const axios = require('axios');
const adal = require('adal-node');

const {
  authorityUrl,
  apiUrl,
  resourceUrl,
  clientId,
  username,
  password,
  tenant
} = config.powerbi;

const powerbiClient = {};

/**
 * Get the embed data for the report ID, which can be used to embed this report in a web application
 * @param {String} type Report | Dashboard
 * @param {String} groupId Power BI Group GUID
 * @param {String} elementId Power BI Dashboard/Report GUID
 */
powerbiClient.getEmbedToken = async function(type, groupId, elementId) {
  const context = new adal.AuthenticationContext(authorityUrl + tenant); //Start adal context
  
  var promise = new Promise(async (resolve, reject) => {  
    context.acquireTokenWithUsernamePassword(resourceUrl, username, password, clientId, async function(err, tokenResponse) {
      if (err) {
        reject('Error occurred when fetching the AAD access token: ' + err.stack);
      } else {
        const authHeader = "Bearer " + tokenResponse.accessToken;	
        debug('Auth Header: ' + authHeader);
        
        try {
          const embedUrl = await getEmbedUrl(authHeader, type, groupId, elementId);
          debug('Embed URL: ' + embedUrl);
          
          const embedData = await getEmbedToken(authHeader, type, groupId, elementId);			
          debug('Embed Token: ' + embedData.token);
          
          debug('Succes: Embed Info sent');
          resolve({ embedUrl, expiration: embedData.expiration, token: embedData.token });
        }
        catch(err) {
          reject(err);
        }
      }
    });
  });

  return promise;
}

/**
 * Get the Power BI embedded URL for the report ID, which can then be used to embed the report
 * @param {String} authHeader Bearer token
 * @param {String} type Report | Dashboard
 * @param {String} groupId Power BI Group GUID
 * @param {String} elementId Power BI Dashboard/Report GUID
 */
async function getEmbedUrl(authHeader, type, groupId, elementId) {
  let headers = {
      "Authorization": authHeader
    };

  try {
    const res = await axios({
      method: 'GET',
      url: apiUrl + 'v1.0/myorg/groups/'+ groupId +'/'+ type + 's', 
      headers: headers
    });
    const data = res.data;
    for(var i = 0; i < data.value.length ; i++){			
      if( data.value[i].id === elementId ){
        return data.value[i].embedUrl;
      }
    }
    return null;
  }
  catch(err) {
      throw err;
  }
};

/**
 * Get the Power BI embed token which can be used to authorize a user to embed this report
 * @param {String} authHeader Bearer token
 * @param {String} type Report | Dashboard
 * @param {String} groupId Power BI Group GUID
 * @param {String} elementId Power BI Dashboard/Report GUID
 */
async function getEmbedToken(authHeader, type, groupId, elementId) {
	const urlForEmbed = apiUrl + 'v1.0/myorg/groups/'+ groupId +'/'+ type+'s/'+ elementId+'/GenerateToken';
	const body = {
		"accessLevel": "View",
		"allowSaveAs": "false"
  };		

  let headers = {
    "Authorization": authHeader,
    "Content-Type": 'application/json; charset=utf-8',
    "Accept": "application/json"
  };

  try {
    const res = await axios({
      method: 'POST',
      url: urlForEmbed, 
      data: body, 
      headers: headers
    });

    let { token, expiration } = res.data;
    expiration = Date.parse(expiration);
    return { expiration, token };
  }
  catch(err) {
      throw err;
  }
};

module.exports = powerbiClient;