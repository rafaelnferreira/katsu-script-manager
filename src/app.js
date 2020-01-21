
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const spawn = require('child_process').spawn;

const app = express();
const port = 3000;


app.set('view engine', 'hbs');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const config = require('./config-init'); // starts all the configuration to be used 
const actions = require('./actions');
const applicationStatus = require('./status').Status;



app.get('/', (req, res) => {
    res.render('overview', applicationStatus.commands);
});

app.post('/spin-up-image', (req, res) => {
    actions.spinUpImages(req.body);
   
    res.render('overview', applicationStatus.commands);

});

// app.get('/read-logs/:serviceName', (req, res) => {
//     const fileLogName = config.logsFolder + req.params.serviceName + '.log';
//     const tail = spawn('tail', ['-f', fileLogName]);

//     tail.stdout.on('data', function (data) {
//         res.write('' + data);                
//     });
// });

app.get('/alt-service/:serviceName', (req, res) => {
    const serviceName = req.params.serviceName;
    actions.altImages(serviceName);

    res.render('overview', applicationStatus.commands);
});

app.listen(port, () => console.log(`Microservices server started on port ${port}`));

