const express = require('express');
const connectDB = require('./configs/dbConfig');
const verifyToken = require('./configs/webhookConfig');
const bodyParser = require("body-parser");
const { urlencoded, json } = require("body-parser");
const axios = require('axios');
const { FacebookAdsApi } = require('facebook-nodejs-business-sdk');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: ['https://main.d1wz6331j8w92r.amplifyapp.com/', 'http://localhost:3000/']
}));

app.use(bodyParser.json());

const authRoutes = require('./controller/authRoutes');
const agentRoutes = require('./controller/agentRoutes');
const webhookRoutes = require('./controller/webhookRoutes');


const port = 3050;

connectDB();

const app_id = '375434261907142';
const app_secret = 'fe48773915d57c3af9d0f7a0d129198e';
const access_token = `${app_id}|${app_secret}`;

FacebookAdsApi.init(access_token);


const loginUrl = FacebookAdsApi.getRedirectUri('https://main.d1wz6331j8w92r.amplifyapp.com/', [
  'manage_pages',
  'pages_show_list',
  'pages_manage_comments', 
  'pages_messaging',
  'pages_manage_metadata', 
  'pages_read_engagement', 
  'pages_read_user_content'
]);

app.get('/request-permissions', (req, res) => {
  res.redirect(loginUrl);
});

app.get('/auth/fb/callback', async (req, res) => {
  const code = req.query.code;

  try {
    // Exchange the authorization code for an access token
    const { access_token } = await facebookAdsApi.initiateAuthorizationCodeFlow(code);

    // Get the logged-in user's details from Facebook using the access token
    const user = await facebookAdsApi.getUserInfo(access_token);

    // Store the access token securely along with user details in the database
    const agent = await Agent.findOne({ email: user.email });

    console.log(user);

    if(agent){
      fbAccount = {
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
      }
      agent.accessToken = access_token;
      agent.fb_accounts.push(fbAccount);
      await agent.save();
    }else{
      res.status(404).send('user not found, please register');
    }

    // Respond with a success message
    res.status(200).send('Authorization successful');
  } catch (error) {
    console.error('Error exchanging authorization code:', error);
    res.status(500).send('Error exchanging authorization code');
  }
});


  app.use('/webhook', webhookRoutes);
  app.use('/auth', authRoutes);
  app.use('/agent', agentRoutes);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});



