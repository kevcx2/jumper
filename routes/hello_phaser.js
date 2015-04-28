var express = require('express');
var router = express.Router();

/* GET hellophaser */

router.get('/', function(req, res) {
  res.render('hello_phaser/index', { title: 'Hellophaser' });
});

module.exports = router;
