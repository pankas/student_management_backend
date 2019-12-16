let config = {};

if(process.env.NODE_ENV=="development"){
    config.db = 'http://localhost:5000'
    }
else
{
    config.db = 'https://10.17.15.43:5000'
}

exports.config;