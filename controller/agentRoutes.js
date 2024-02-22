const express = require('express');
const router = express.Router();
const agentService = require('../services/agentService');
const verifyJWT = require('../middlewares/verifyJWT');

router.use(verifyJWT);
router.route('/agentPages')
         .get(agentService.getPages);
router.route('/agentPageDetails/:page_id')
         .get(agentService.getPageDetails);