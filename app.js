const express = require('express');
const connectDatabase = require('./database/db_config');
require('dotenv').config()

const app = express();

connectDatabase();

app.use(express.json({ extended: false }))

app.get('/', (req, res) => res.send('API Working!'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server Started On Port ${PORT}`))