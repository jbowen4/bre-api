const express = require('express');
const { db } = require("./config/db");
const cors = require('cors');

const app = express();

// Test DB
db.authenticate()
    .then(() => console.log('Database connected...'))
    .catch(err => console.log(err))

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(cors());

app.use('/api/pros', require('./routes/pros'));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));