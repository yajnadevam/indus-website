const express = require("express");
const dns = require("dns");
const ViteExpress = require("vite-express");
const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
// const {expect, it, test} = require("./lib/runner");

const app = express();
var jsonParser = bodyParser.json();
const salt = bcrypt.genSaltSync(10);

if (process.env.NODE_ENV == 'production') {
  require('dotenv').config();
} else {
  require('dotenv').config({path: './local.env'});
}

// Create a MySQL connection
async function createConnection() {
  let config = {
      host: process.env.MYSQL_ROOT_HOST,
      user: process.env.MYSQLDB_USER,
      password: process.env.MYSQLDB_ROOT_PASSWORD,
      database: process.env.MYSQLDB_DATABASE,
      localAddress: process.env.NODE_DOCKER_PORT,
      port: process.env.MYSQLDB_DOCKER_PORT,
  }
  console.log(config);
  return mysql.createConnection(config);
}

async function userData(connection, username) {
  var queryRes = await connection.execute(
    "SELECT username,email,body,header,usertype FROM USER WHERE username = ?",
    [username]
  );
  return queryRes[0][0];
}

async function main() {
  var connection = await createConnection();

  //test MySQL
  var [randomResults, randomFields] = await connection.execute(
    "SELECT * FROM USER WHERE RAND() < .3 LIMIT 1; "
  );
  console.log(
    "A possible user's Login credentials are \nusername: " +
      randomResults[0].USERNAME +
      "  \npassword: " +
      randomResults[0].PASSWORD
  );

  // The below statement hashes all plaintext passwords in the db.
  await connection
    .query("SELECT USERNAME, PASSWORD FROM USER;", [])
    .then((queryArg) => {
      let queryResults = queryArg[0];
      process.stdout.write("Hashing passwords...");
      const updatePromises = queryResults.map((queryResult) => {
        return connection
          .query(`UPDATE USER SET HASHEDPASSWORD = ? WHERE USERNAME = ?;`, [
            bcrypt.hashSync(queryResult["PASSWORD"], salt),
            queryResult["USERNAME"],
          ])
          .catch(console.error);
      });
      return Promise.all(updatePromises);
    })
    .then(() => {
      console.log(" done");
    })
    .catch(console.error);

  //While we still keep the unhashed password, the rest of the code will use `hashedPassword` to verify the password.
  //The plaintext password is retained for debugging & testing purposes.
  //The hashing algorithm used is more secure, `bcrypt` prevents rainbow-table attacks
  //A disadvantage is that we cannot retrieve the hashed password back(we can only perform compare operations).
  //Hence I will still have to store the plaintext to debug for existing users.

  // Handle POST requests to the login endpoint
  app.post("/api/login", jsonParser, async (req, res) => {
    console.log(req.body);
    /* console.log(req); */
    const username = req.body.username;
    const password = req.body.password;
    connection = await createConnection();

    // Query the MySQL database for the user credentials
    connection
      .query("SELECT HASHEDPASSWORD FROM USER WHERE USERNAME = ?", [username])
      .then((queryArg) => {
        results = queryArg[0];
        if (results.length === 0) {
          console.log("No such users exist.");
          res.status(401).json({ message: "No such user exists" });
        } else if (
          !bcrypt.compareSync(password, results[0]["HASHEDPASSWORD"])
        ) {
          console.log("Incorrect password entered.");
          res.status(401).json({ message: "Incorrect password entered" });
        } else {
          // Return a success message
          console.log("Successful Login!");
          userData(connection, username).then((user) => {
            console.log("user: " + JSON.stringify(user));
            res.json({ message: "Login successful", user });
          });
        }
      })
      .catch((error) => {
        if (error) {
          console.log("Error retrieving userdata!");
          res.status(500).json({ error });
        }
      });
  });

  // Handle POST requests to the register endpoint
  app.post("/api/register", jsonParser, async (req, res) => {
    console.log(req.body);
    /* console.log(req); */
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const userType = req.body.userType;
    connection = await createConnection();

    connection
      .query(
        "INSERT INTO USER(USERNAME, EMAIL, HASHEDPASSWORD, PASSWORD, USERTYPE) VALUES (?, ?, ?, ?, ?)",
        [username, email, bcrypt.hashSync(password, salt), password, userType]
      )
      .then((queryArg) => {
        var results = queryArg[0];
        console.log("Successful Registration of username: " + username);
        userData(connection, username).then((user) => {
          console.log("user: " + JSON.stringify(user));
          res.json({ message: "Registration successful", user });
        });
      })
      .catch((error) => {
        if (error.code == "ER_DUP_ENTRY") {
          console.log("Username already exists");
          res.status(401).json({ message: "User already exists" });
        } else {
          console.log(
            "Error retrieving userdata! Error: " + JSON.stringify(error)
          );
          res.status(500).json({ error });
        }
      });
  });

  app.post("/api/updateUser", jsonParser, async (req, res) => {
    const user = req.body.user;
    connection = await createConnection();
    console.log(JSON.stringify(user));

    connection
      .query(
        `UPDATE USER SET EMAIL = ?, HEADER = ?, BODY = ? WHERE USERNAME = ?`,
        [user.email, user.header, user.body, user.username]
      )
      .then((queryArg) => {
        console.log("Successful update of " + user.username);
        res.json({ message: "Sucessful update" });
      })
      .catch((error) => {
        console.log("Error updating userdata! Error: " + JSON.stringify(error));
        res.status(500).json({ error });
      });
  });

  app.get("/api/getSeal/:sealId", jsonParser, async (req, res) => {
    connection = await createConnection();
    const sealId = Number(req.params.sealId);
    
    const t1 = connection.execute(`
      SELECT *
      FROM SEAL
      LEFT JOIN INSCRIPTION ON SEAL.SEALID = INSCRIPTION.SEALID
      LEFT JOIN SITE ON SEAL.SITEID = SITE.SITEID
      LEFT JOIN (SELECT ICONOGRAPHYFEATURES.SEALID, FEATURE.QUALITY 
        FROM ICONOGRAPHYFEATURES 
        LEFT JOIN FEATURE ON FEATURE.QUALITYID = ICONOGRAPHYFEATURES.QUALITYID) AS FEATURES ON SEAL.SEALID = FEATURES.SEALID
      LEFT JOIN ICONOGRAPHY ON ICONOGRAPHY.SEALID = SEAL.SEALID
      WHERE SEAL.SEALID = ${sealId};
    `).then((r1, q1) => r1[0])
    
    const t2 = connection.execute(`
      SELECT USERNAME, TRANSLITERATION
      FROM DECIPHERMENT
      WHERE SEALID = ${sealId};
    `).then((r2, q2) => r2);
    
    const t3 = connection.execute(`
         SELECT GLYPH.UNICODE FROM GLYPHSEQUENCE
         INNER JOIN GLYPH ON GLYPHSEQUENCE.GLYPHID = GLYPH.GLYPHID
         WHERE GLYPHSEQUENCE.SEALID = ${sealId}
         ORDER BY GLYPHSEQUENCE.IDX ASC;
    `).then((r3, q3) => {
      return r3[0].map((row) => row.UNICODE).join(" ");
    });
    
    Promise.all([t1, t2, t3]).then(async ([r1, decipherments, toRender]) => {
      var sealInfo = r1[0];
      sealInfo.toRender = toRender;
      res.json({ sealInfo, decipherments })
    }).catch(console.error);
  });

  app.get("/api/getTable", jsonParser, async (req, res) => {returnTable("", res)});
  app.get("/api/getTable/:query", jsonParser, async (req, res) => {returnTable(decodeURIComponent(req.params.query).replace('"', ''), res)});
  
  async function returnTable(query, res) {
    connection = await createConnection();
    const regex = `(?i)(\b${query}\b)|(${query})`
    
    connection
      .query(
        `
        SELECT SEAL.SEALID, INSCRIPTION.DIRECTION, SITE.NAME
        FROM SEAL
        LEFT JOIN INSCRIPTION ON SEAL.SEALID = INSCRIPTION.SEALID
        LEFT JOIN SITE ON SEAL.SITEID = SITE.SITEID
        WHERE INSCRIPTION.SEALID = ? OR 
          (SEAL.CISI LIKE ? AND NOT EXISTS (
            SELECT S.CISI FROM SEAL S WHERE S.CISI = SEAL.CISI
          )) OR 
          (SEAL.CISI = ? OR 
            SEAL.MATERIAL REGEXP ? OR 
            SEAL.MUSEUM REGEXP ? OR 
            SITE.NAME REGEXP ? AND 
            ? NOT REGEXP "^[0-9]+$")
      `
      , [query, query + '%', query, regex, regex, regex, query])
      .then(async (queryArg) => {
        const results = queryArg[0];
        const toReturn = await Promise.all(
          results.map(async (result) => {
            var [rows] = await connection.execute(
              `SELECT GLYPH.UNICODE FROM GLYPHSEQUENCE
               INNER JOIN GLYPH ON GLYPHSEQUENCE.GLYPHID = GLYPH.GLYPHID
               WHERE GLYPHSEQUENCE.SEALID = ?
               ORDER BY GLYPHSEQUENCE.IDX ASC;`,
              [result["SEALID"]]
            );
            rows = rows.map((row) => row.UNICODE);
            result["toRender"] = rows.join(" ");
            return result;
          })
        );
        
        console.log(toReturn);
        res.json({ toReturn });
      })
      .catch(console.error);
  };
  
  app.get('/api/checkId/:sealId', jsonParser, async (req, res) => {
    connection = await createConnection();
    
    const sealId = decodeURIComponent(req.params.sealId);
    connection.execute(`
      SELECT GLYPH.UNICODE, DIRECTION FROM GLYPHSEQUENCE                  
      INNER JOIN GLYPH ON GLYPHSEQUENCE.GLYPHID = GLYPH.GLYPHID
      LEFT JOIN INSCRIPTION ON INSCRIPTION.SEALID = GLYPHSEQUENCE.SEALID
      WHERE GLYPHSEQUENCE.SEALID = ?
      ORDER BY GLYPHSEQUENCE.IDX ASC;`, [sealId]).then((queryArg) => {
        const results = queryArg[0];
        if (results.length == 0) {
          res.status(404).json({ message: "Invalid ID Entered"});
        } else {
          var toReturn = {}
          toReturn["toRender"] = results.map((result) => result.UNICODE).join(" ");
          toReturn["direction"] = results[0].DIRECTION;

          res.json({ toReturn, message: ""});
        }
      });

  });
 
  app.post('/api/decipherments', jsonParser, async (req, res) => {
    const username = decodeURIComponent(req.body.username);
    connection = await createConnection();
    connection.execute(`
      SELECT TRANSLITERATION, DECIPHERMENT.SEALID, DIRECTION
      FROM DECIPHERMENT
      LEFT JOIN INSCRIPTION ON DECIPHERMENT.SEALID = INSCRIPTION.SEALID
      WHERE USERNAME = ?
      ORDER BY DECIPHERMENT.SEALID ASC;
    `, [username]).then(async (queryArg) => {
      const results = queryArg[0];
      const decipherments = await Promise.all(
        results.map(async (result) => {
          var [rows] = await connection.execute(
            `SELECT GLYPH.UNICODE FROM GLYPHSEQUENCE
             INNER JOIN GLYPH ON GLYPHSEQUENCE.GLYPHID = GLYPH.GLYPHID
             WHERE GLYPHSEQUENCE.SEALID = ?
             ORDER BY GLYPHSEQUENCE.IDX ASC;`,
            [result["SEALID"]]
          );
          rows = rows.map((row) => row.UNICODE);
          result["toRender"] = rows.join(" ");
          return result;
        })
      );
      
      res.json({ decipherments });
    }).catch(console.error);
  });

  app.post('/api/updateDecipherment', jsonParser, async (req, res) => {
    // Delete then re-add. This works for both updates and creation. 
    connection = await createConnection();

    connection.execute(`
      DELETE 
      FROM DECIPHERMENT
      WHERE USERNAME = ? AND SEALID = ?;
    `, [req.body.username.trim(), req.body.sealId]).then(async (queryArg) => {
      return connection.execute(`
        INSERT INTO DECIPHERMENT (USERNAME, SEALID, TRANSLITERATION) VALUES
        ("${req.body.username}", ${req.body.sealId}, "${req.body.newTransliteration}") ;
      `);      
    }).then(async (queryArg) => {
      res.json({ message: 'Update successful'});
    }).catch(console.err);
  });
  
  app.post('/api/deleteDecipherment', jsonParser, async (req, res) => {
    connection = await createConnection();
    
    connection.execute(`
      DELETE 
      FROM DECIPHERMENT
      WHERE USERNAME = ? AND SEALID = ?;
    `, [req.body.username.trim(), req.body.sealId]).then(async (queryArg) => {
      const result = queryArg[0]
      console.log(`Deleted ${result.affectedRows} rows`);
      res.json({ message: 'Delete successful'});
    }).catch((error) => {
      console.error('Error occurred', error);
      res.status(500).json({ message: 'Internal server error' });
    });
  });
 
  app.post('/api/assignments/', jsonParser, async (req, res) => {
    connection = await createConnection();
    
    const username = decodeURIComponent(req.body.username);
    connection.execute(`
      SELECT WORKSON.SEALID, DIRECTION, SITE.NAME, SURVEY.SURVID
      FROM WORKSON
      LEFT JOIN INSCRIPTION ON WORKSON.SEALID = INSCRIPTION.SEALID
      LEFT JOIN SEAL ON SEAL.SEALID = WORKSON.SEALID
      LEFT JOIN SITE ON SEAL.SITEID = SITE.SITEID
      LEFT JOIN SURVEY ON WORKSON.SURVID = SURVEY.SURVID
      WHERE WORKSON.USERNAME = ?
      ORDER BY WORKSON.SEALID ASC;
    `, [username]).then(async (queryArg) => {
      const results = queryArg[0];
      const assignments = await Promise.all(
        results.map(async (result) => {
          var [rows] = await connection.execute(
            `SELECT GLYPH.UNICODE FROM GLYPHSEQUENCE
             INNER JOIN GLYPH ON GLYPHSEQUENCE.GLYPHID = GLYPH.GLYPHID
             WHERE GLYPHSEQUENCE.SEALID = ? 
             ORDER BY GLYPHSEQUENCE.IDX ASC;`
          , [result["SEALID"]]);
          rows = rows.map((row) => row.UNICODE);
          result["toRender"] = rows.join(" ");
          return result;
        })
      );

      const surveys = (await connection.execute(`SELECT SURVID, NAME FROM SURVEY `))[0];
      res.json({ assignments, surveys });
    }).catch(console.error);
  });

  app.post('/api/updateAssignment', jsonParser, async (req, res) => {
    connection = await createConnection();
    
    // Delete then re-add. This works for both updates and creation. 
    connection.execute(`
      DELETE 
      FROM WORKSON
      WHERE USERNAME = "${req.body.username.trim()}" AND SEALID = ${req.body.sealId} 
    `).then(async (queryArg) => {
      return connection.execute(`
        INSERT INTO WORKSON (USERNAME, SEALID, SURVID) VALUES
        ("${req.body.username}", ${req.body.sealId}, ${req.body.newSurvey}) ;
      `);      
    }).then(async (queryArg) => {
      res.json({ message: 'Update successful'});
    });
  });
  
  app.post('/api/deleteAssignment', jsonParser, (req, res) => {
    console.log(`
      DELETE
      FROM WORKSON
      WHERE USERNAME = ? AND SEALID = ? AND SURVID = ?;
    `, [req.body.username.trim(), req.body.survId]);
    connection.execute(`
      DELETE
      FROM WORKSON
      WHERE USERNAME = ? AND SEALID = ? AND SURVID = ?;
    `, [req.body.username.trim(), req.body.sealId, req.body.survId]).then(async (queryArg) => {
      const result = queryArg[0];
      console.log(`Deleted ${result.affectedRows} rows`);
      res.json({ message: 'Delete successful'});
    }).catch((error) => {
      console.error('Error occurred', error);
      res.status(500).json({ message: 'Internal server error' });
    });
  });


  //fixes bug when opening app
  dns.setDefaultResultOrder("ipv4first");

  ViteExpress.config({
    vitePort: 8080,
    // mode: 'production',
  });

  const server = ViteExpress.listen(app, 3000, () => {
    console.log(
      "Server is listening at http://127.0.0.1:3000 please open this link in the browser to this otherwise it will not work. "
    );
  });
}

main();
