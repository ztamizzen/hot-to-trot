const { Worker } = require('worker_threads');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://localhost:27017';
const dbName = 'horseraces';
const col = 'races';
const client = new MongoClient(url, { useUnifiedTopology: true });

function insertDocuments(collection, data, callback) {
    assert.notEqual(null, collection);
    assert.notEqual(null, data);
    assert.notEqual(null, callback);
    collection.find({ "event": data.event, "horse.id": data.horse.id, time: data.time }).toArray((error, docs) => {
        if (error) {
            console.error(error);
        }
        if (docs.length > 0) {
            callback(docs);
        } else {
            collection.insertOne(data, function (err, result) {
                if (err) {
                    console.error('Insert error:', err);
                }
                callback(result);
            });
        }
    });
}

function runService() {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./service.js');
        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });
    });
}

async function run(collection) {
    assert.notEqual(null, collection);
    return runService().then(data => {
        if (data.race) {
            insertDocuments(collection, data.race, result => {
                race(collection);
            });
        } else {
            race(collection);
        }
    }).catch(function () {
        race(collection);
    });
}


function race(collection) {
    assert.notEqual(null, collection);
    run(collection).catch(err => console.error('Err', err));
}

client.connect(err => {
    assert.equal(null, err);
    const db = client.db(dbName);
    const collection = db.collection(col);
    race(collection);
});
