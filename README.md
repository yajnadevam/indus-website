# Sindhu Saraswati Website Project

First, we must install MySQL, and ensure that it is correctly installed. 
Then run `mysql -u root -p yourRootPassword  < population-script.sql`.

Create a file called `db.config.js`. It should have this general format. 

```
let config = {
    host: '127.0.0.1',
    user: 'indususer',
    password: 'password123',
    database: "induswebsite",
};

module.exports = config;
```

Then, we can run it with `npm install && node server.js `
