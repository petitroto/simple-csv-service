const _ = require('lodash');
const express = require('express')
const CsvDb = require('./csvdb');
const autoCast = require('./autocast');

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
const port = 3030;

app.get('/:dbName', (req, res) => {
  const {dbName} = req.params
  if (!isDbNameValid(dbName)) return res.end();
  const db = CsvDb.getDb(dbName);
  const query = _.mapValues(req.query, autoCast);
  const result = db.find(query);
  res.send(result);
});

app.post('/:dbName', (req, res) => {
  const {dbName} = req.params
  if (!isDbNameValid(dbName)) return res.end();
  const db = CsvDb.getDb(dbName);
  const result = db.add([req.body]);
  db.save();
  res.send(result);
});

app.put('/:dbName', (req, res) => {
  const {dbName} = req.params
  if (!isDbNameValid(dbName)) return res.end();
  const db = CsvDb.getDb(dbName);
  const query = _.mapValues(req.query, autoCast);
  const result = db.update(query, req.body);
  db.save();
  res.send(result);
});


app.delete('/:dbName', (req, res) => {
  const {dbName} = req.params
  if (!isDbNameValid(dbName)) return res.end();
  const db = CsvDb.getDb(dbName);
  const query = _.mapValues(req.query, autoCast);
  const result = db.remove(query);
  db.save();
  res.send(result);
});

/**
 * 簡易な不正ファイル名チェック
 * @param dbName
 */
function isDbNameValid(dbName) {
  return dbName.match(/^[0-9a-zA-Z]+$/)
}

app.listen(port, () => {
  console.log(`CSV Service listening at http://localhost:${port}`);
});
