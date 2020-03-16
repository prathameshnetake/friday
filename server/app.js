const express = require('express')
const next = require('next')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const server = next({ dev })
const handle = server.getRequestHandler()
const bodyParser = require("body-parser");
const r = require('rethinkdb');
const config = require('./config.js')

server.prepare().then(async () => {

  // connect to the DB
  const conn = await r.connect({ db: 'friday' });
  try {
    const safe = await r.table('control').indexWait('createdAt').run(conn)
  } catch {
    const res = await r.dbCreate('friday').run(conn).finally(function () {
      return r.tableCreate('control').run(conn)
    }).finally(function () {
      r.table('control').indexCreate('createdAt').run(conn);
    }).finally(function (result) {
      r.table('control').indexWait('createdAt').run(conn)
    })
  }

  // Update the existing devices
  const device_config = require('../config.json')
  const data = device_config.PLUGINS.FridayAlexaPlugIn.DEVICES.map(device => {
    return { ...device, status: 0 }
  })
  try {
    const result = await r.table('control').insert(data).run(conn)
    console.log(result)
  } catch (err) {
    console.log(err)
  }

  const server = express()
  const control = require("./API/control")
  const app = express();
  server.use(createConnection)
  server.use(require("cors")());
  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({
    extended: false
  }));
  server.use("/control", control);
  server.get('/posts/:id', (req, res) => {
    return server.render(req, res, '/posts', { id: req.params.id })
  })
  server.all('*', (req, res) => {
    return handle(req, res)
  })
  server.use(closeConnection)
  conn.close()

  /*
 * Create a RethinkDB connection, and save it in req._rdbConn
 */
  function createConnection(req, res, next) {
    r.connect(config.rethinkdb).then(function (conn) {
      req._rdbConn = conn;
      next();
    }).error(handleError(res));
  }

  /*
  * Close the RethinkDB connection
  */
  function closeConnection(req, res, next) {
    req._rdbConn.close();
  }

  /*
 * Send back a 500 error
 */
  function handleError(res) {
    return function (error) {
      console.log(error)
      res.send(500, { error: error.message });
    }
  }


  server.listen(port, err => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})