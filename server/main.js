const express = require('express');
const multer = require('multer');

const app = express();
app.use(express.static(__dirname + '/../dist'));

var upload = multer({dest: __dirname + "/../dist/"});
var type = upload.single('upl');

app.get('/', function(req,res) {
	res.sendFile(path.join(__dirname, '/../dist/index.html'));
});

app.listen(8080);