let config = {};

if(process.env.NODE_ENV=="development"){
    config.db = 'http://localhost:5000'
    }
else
{
    config.db = 'https://quiet-bayou-33585.herokuapp.com/'
}

exports.config;