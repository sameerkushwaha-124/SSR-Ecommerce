# "We use the config package to get data from configuration files based on the current environment."
1. npm install config

2. Install the package:
config/
  default.json
  production.json
  development.json

3. default.json:
{
  "db": {
    "host": "localhost",
    "port": 27017
  }
}


4. Usage in your code (e.g., app.js):

const config = require('config');
const dbConfig = config.get('db');
console.log(dbConfig.host); // "localhost"

