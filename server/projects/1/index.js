const express = require('express');

const app = express();

app.get("/", (req, res) => {
    res.send({message: 'Hello world'});
});

app.listen(3000, () => {
    console.log('Server listening on PORT 3000');
})