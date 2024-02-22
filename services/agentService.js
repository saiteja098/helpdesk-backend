const asyncHandler = require('express-async-handler');
const webhookService = require('./services/webhookService');
const verifyToken = require('../configs/webhookConfig');


const getPages = asyncHandler(async (req, res, next) => {
  try {
    // Fetch the associated page IDs using the access token
    const access_token = req.accessToken;
    const response = await axios.get(
      `https://graph.facebook.com/v13.0/me/accounts?access_token=${access_token}`
    );
    const pages = response;
    res.status(200).send(pages);
  } catch (error) {
    console.error(`Error getting pages: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const getPageDetails = asyncHandler( async(req, res) => {
    try{
        const access_token = req.accessToken;
        const pageId = req.params.page_id;
        webhookService.setupWebhooks(pageId, access_token, verifyToken);
        const response = await axios.get(`https://graph.facebook.com/v19.0/${pageId}`, {
            params: {
              access_token: access_token
            }
          });
        const pageDetails = response;
        res.status(200).send(pageDetails);

    } catch (error) {
        console.error(`Error getting page details: ${error.message}`);
        res.status(500).json({ message: "Internal Server Error" });
    }
})



module.exports = {
    getPages,
    getPageDetails,
}