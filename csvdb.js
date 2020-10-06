const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const KeyQL = require('keyql');
const _ = require('lodash');

class CsvDb {
  constructor(pathToCsv) {
    this.pathToCsv = pathToCsv;
    this.csv = fs.readFileSync(pathToCsv, 'utf-8');
    this.papaObject = Papa.parse(this.csv, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true
    });
    if (this.papaObject.errors.length > 0) {
      console.error(this.papaObject.errors);
      throw new Error('Invalid Csv file');
    }
    this.kqlDataset = new KeyQL(this.papaObject.data);
  }

  save() {
    const csv = Papa.unparse(this.papaObject.data);
    fs.writeFileSync(this.pathToCsv, csv, 'utf-8');
    return this.papaObject.data;
  }

  find(where) {
    return this.kqlDataset.query().select([where]).values();
  }

  add(items) {
    this.papaObject.data = this.papaObject.data.concat(items);
    return this.papaObject.data
  }

  update(where, properties) {
    const targets = this.find(where)
    const mergedTargets = targets.map(target => _.merge(target, properties))
    this.remove(where);
    this.add(mergedTargets);
    return mergedTargets;
  }

  remove(where) {
    const targets = this.find(where)
    this.papaObject.data = _.difference(this.papaObject.data, targets)
    return targets;
  }

  static getDb(dbName) {
    const csvFilePath = path.resolve(__dirname, `${dbName}.csv`);
    if (!fs.existsSync(csvFilePath)) {
      throw new Error('No such CSV file');
    }
    return new CsvDb(csvFilePath);
  }
}

module.exports = CsvDb;
