const express = require('express');
const router = express.Router();
const webhookService = require('../services/webhookService');


router.route('/')
      .post(webhookService.receiveEvents)
      .get(webhookService.verifyWebhook)