const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3001;

mongoose.connect("mongodb://mongodb:27017/contacts",{useNewUrlParser: true, useUnifiedTopology: true});

const Schema = mongoose.Schema;
const UserSchema = new Schema({
    name: {type: String}
});
//this will create a plural collection name, ex "peoples"
const Person = mongoose.model('People', UserSchema);

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

app.get('/', (req, res) => {
    res.send("hi!")
});

app.get('/persons', (req, res) => {
    Person.find({}, function (err, people) {
        if (err) {
            res.send('smth wrong happened');
        }
        res.json(people);
    });
});

app.post('/person', (req, res) => {
    let user = new Person(req.body);
    user.save(function (err, user) {
        res.json(user);
    })
})

app.delete('/person/:id', async (req, res) => {
    const user = await Person.findByIdAndDelete(req.params.id);
    if(!user) {
        res.send("no person")
    }
    res.status(200)
        .json({success: true, data: `Person with id ${req.params.id} has been deleted`})
});

app.delete('/delete-all', async (req, res) => {
    const user = await Person.deleteMany();
    if(!user) {
        res.send("no deletion happened")
    }
    res.status(200)
        .json({success: true, data: `All gone`})

});

app.listen(PORT, () => console.log(`Servers is running on ${PORT}`))
