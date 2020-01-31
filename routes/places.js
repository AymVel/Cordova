var express = require('express');
var router = express.Router();
var Sequelize = require('sequelize');

const options ={
  dialect : 'mysql',
      host    :  '127.0.0.1',
      port : '3306'
}
var sequelize = new Sequelize('cordova_maps', 'root', '', options );

var Places = sequelize.define('lieux', {
  id:{type: Sequelize.INTEGER,
      primaryKey: true},
  Nom: Sequelize.STRING,
  Description: Sequelize.STRING,
  Longitude: Sequelize.FLOAT,
  Latitude: Sequelize.FLOAT

}, { tableName: 'lieux',
    timestamps: false});




/* GET users listing. */
router.get('/', function(req, res, next) {
    Places.findAll(
    ).then(function(val) {
        res.send(val)
    })
    })


module.exports = router;

