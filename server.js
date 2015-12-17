var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 8080;
var todos = [];
var todoNextId = 1;

// Middleware to parse http request body to json
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send('Todo API Root');
});

app.get('/todos', function (req, res) {
    res.json(todos);
});

app.get('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id, 10);
    
    // Underscore library using findWhere method to where the first object 
    // in todos that has an id that matches what the user submitted
    var matchedTodo = _.findWhere(todos, {id: todoId});
    
    if (matchedTodo) {
        res.json(matchedTodo);
    } else {
        res.status(404).send();
    }
    
});

// POST /todos
// Use body-parser to access req body as body object
app.post('/todos', function (req, res) {
    var body = _.pick(req.body, 'description', 'completed');
    
    // Underscore used to validate values
    if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
		return res.status(400).send();
	}
	
	body.description = body.description.trim();
    
    // add id field
    body.id = todoNextId++;
    
    // push body into array
    todos.push(body);
    
    res.json(body);
});

// DELETE /todos/:id
app.delete('/todos/:id', function (req, res) {
    var body = _.pick(req.body, 'description', 'completed');
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {id: todoId});
    
    if (!matchedTodo) {
        res.status(404).json({"error": "no todo found with that id"});
    } else {
        todos = _.without(todos, matchedTodo);
        res.json(matchedTodo);
    }

});

app.listen(PORT, function () {
    console.log('Express listening on port ' + PORT + '!');
})