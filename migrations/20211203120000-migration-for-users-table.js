'use strict';

var dbm;
var type;
var seed;
var fs = require('fs');
var path = require('path');
var Promise;

exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
  Promise = options.Promise;
};

exports.up = function(db) {
  const files = ['20211203120000-migration-for-users-table-up.sql'];
  const filePaths = files.map(file => path.join(__dirname, 'sqls', file));

  const readFiles = filePaths.map(filePath => {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, { encoding: 'utf-8' }, (err, data) => {
        if (err) {
          return reject(err);
        }
        console.log(`Received data from ${filePath}`);
        resolve(data);
      });
    });
  });

  return Promise.all(readFiles)
    .then((dataArray) => {
      const sqlPromises = dataArray.map(data => db.runSql(data));
      return Promise.all(sqlPromises);
    })
    .catch(err => {
      console.error('Error in reading files or running SQL:', err);
      throw err;
    });
};

exports._meta = {
  "version": 1
};
