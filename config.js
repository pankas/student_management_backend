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
      'USERNAME':'app155962895-u16AxG',
      'PASSWORD':'b.0vf9XO48JqaL.Yx8gDiL9D3LvnFNGgit ',
    'neo4j': 'local',
    'neo4j-local': 'bolt://hobby-ponjfgnijmdigbkepecaofdl.dbs.graphenedb.com:24787',
    'base_url': config.config,
    'api_path': '/api/v0'
  });

module.exports = nconf;