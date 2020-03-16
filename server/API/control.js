const express = require("express");
const router = express.Router();
const r = require('rethinkdb');
const axios = require('axios').default;

const handleOnControl = async (req, res) => {
  const url = req.body.operation;
  try {
    const response = await axios.get(url);
    console.log(response);
  } catch (e) {
    console.log(e);
  }
  const conn = req._rdbConn
  const device = await (await r.db('friday')
    .table('control')
    .filter({ id: req.body.id })
    .update({ status: 1 })
    .run(conn));
  console.log(device)
  res.json({ msg: "Success", status: "on" })
}

const handleOffControl = async (req, res) => {
  const url = req.body.operation;
  try {
    const response = await axios.get(url);
    console.log(response);
  } catch (e) {
    console.log(e);
  }
  const conn = req._rdbConn
  const device = await (await r.db('friday')
    .table('control')
    .filter({ id: req.body.id })
    .update({ status: 0 })
    .run(conn));
  console.log(device)
  res.json({ msg: "Success", status: "off" })
}


const handleStatusControl = async (req, res) => {
  const conn = req._rdbConn
  const device = await (await r.db('friday').table('control').filter({ id: req.body.id }).run(conn)).toArray()
  res.json({ msg: "Success", status: device[0].status === 1 ? 'on' : 'off' })
}

router.post("/on", handleOnControl);
router.post("/off", handleOffControl);
router.post("/status", handleStatusControl);

module.exports = router;