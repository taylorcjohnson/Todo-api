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

// GET /todos
app.get('/todos', function (req, res) {
    var queryParams = req.query;
    var filteredTodos = todos;
    
    if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
        filteredTodos = _.where(todos, {completed: true});
    } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
        filteredTodos = _.where(todos, {completed: false});
    }
    
    res.json(filteredTodos);
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
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {id: todoId});
    
    if (!matchedTodo) {
        res.status(404).json({"error": "no todo found with that id"});
    } else {
        todos = _.without(todos, matchedTodo);
        res.json(matchedTodo);
    }

});

// PUT /todos/:id
app.put('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {id: todoId});
    var body = _.pick(req.body, 'description', 'completed');
    var validAttributes = {};
    
    // If there was not a valid id, return 404
    if (!matchedTodo) {
        return res.status(404).send();
    }
    
    // Update valid completed property
    if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
        validAttributes.completed = body.completed;  
    } else if (body.hasOwnProperty('completed')) {
        return res.status(400).send();
    }
    
    // Update valid description property
    if (body.hasOwnProperty('description') && !_.isString(body.description) && body.description.trim().length > 0) {
        validAttributes.completed = body.completed;  
    } else if (body.hasOwnProperty('description')) {
        return res.status(400).send();
    }
    
    // Replace valid property in data, send back user provided object
    _.extend(matchedTodo, validAttributes);
    res.json(matchedTodo);
});

app.listen(PORT, function () {
    console.log('Express listening on port ' + PORT + '!');
})