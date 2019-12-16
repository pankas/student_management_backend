'use strict';

var nconf = require('nconf');
var config = require('./url');

nconf.env(['PORT', 'NODE_ENV'])
  .argv({
    'e': {
      alias: 'NODE_ENV',
      describe: 'Set production or development mode.',
      demand: false,
      default: 'development'
    },
    'p': {
      alias: 'PORT',
      describe: 'Port to run on.',
      demand: false,
      default: 5000
    },
    'n': {
      alias: "neo4j",
      describe: "Use local or remote neo4j instance",
      demand: false,
      default: "local"
    }
  })
  .defaults({
      'USERNAME':'neo4j',
      'PASSWORD':'innav',
    'neo4j': 'local',
    'neo4j-local': 'bolt://localhost:7687',
    'base_url': config.config,
    'api_path': '/api/v0'
  });

module.exports = nconf;