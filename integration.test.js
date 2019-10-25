const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/horseraces', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Connected');
    const raceSchema = new mongoose.Schema({
        event: String,
        horse: {
            id: Number,
            horse: String
        },
        time: Number
    });
    const Race = mongoose.model('Race', raceSchema);
    const dazzle = new Race({
        event: "start",
        horse: {
            id: 1,
            horse: "Dazzle"
        },
        time: 0
    });
    dazzle.save((err, dazzle) => {
        if (err) return console.error(err);
        console.log(dazzle);
    });
});
