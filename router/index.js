const express=require('express');
const { route } = require('express/lib/application');

const {errorView,paymentView } = require('../controller/routecontroller');
const router=express.Router();
router.get('/payment',paymentView);
router.use(errorView);
module.exports = router;