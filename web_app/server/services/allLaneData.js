const db = require('../services/db');
const config = require('../config');
const helper = require('../services/helper');

async function getAllLaneData(page = 1){
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    "SELECT * FROM lanecount LIMIT ?,?",
    [offset,  config.listPerPage]
  );

  const data = helper.emptyOrRows(rows);
  const meta = {page};

  return {
    data,
    meta
  }
}

module.exports = {
    getAllLaneData
}