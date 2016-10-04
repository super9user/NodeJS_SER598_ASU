var express = require('express');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser');
var helper = require("./helper");
var session = require('express-session');

var app = express();
var port = 8081;
var entries = [];

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(session({
    secret: 'tanmays_secret_key',
    cookie  : { maxAge  : 60*60*1000 }
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function method_not_allowed(req, res, next) {
    res.status(405).send('405 - The method specified in the request is not allowed.');
}

app.get('/', function(req, res){
    var cookies = req.cookies;

    if(helper.isNewUser(cookies)){
        // redirect to user registration page
        res.status(302);
        res.setHeader("Refresh", "3; URL=registration");
        res.render('welcome');
    }else{
        // returning user

        var data = {};
        for (var key in cookies) {
            if(key == "fname"){
                data.fname = cookies[key];
            }else if(key == "lname"){
                data.lname = cookies[key];
            }
        }
        data = helper.clean(data);
        var list = helper.filterEntries(data, entries);

        var matching_entries;
        if(list.length > 0){
            matching_entries = helper.get_matching_entires(list[0], entries, 3);
            res.render('landing_page', {
                matching_entries: matching_entries,
                fname: data.fname,
                lname: data.lname
            });
        }else{
            res.status(302);
            res.setHeader("Refresh", "3; URL=registration");
            res.render('welcome');
        }   
    }
});

app.all('/', method_not_allowed);

app.get("/registration", function(req, res){
    res.render('registration/page1', {
        data: req.session
    });
});

app.all('/registration', method_not_allowed);

app.post('/post_coder', function(req, res){
    var body = req.body;
    var action = body.submit;
    var page = parseInt(body.page);
    var data = {};
    var render_page = 'registration/error';
    
    if(action=='next'){
        render_page = "registration/page" + (page + 1);
        switch(page){
            case 1:
                req.session.fname = body.fname;
                req.session.lname = body.lname;
                break;

            case 2:
                req.session.experience = body.experience;
                break;

            case 3:
                req.session.languages = helper.clean_languages({languages: body.languages}).languages;
                break;

            case 4:
                req.session.availability = helper.clean_availability({availability: body.availability}).availability;
                break;

            default:
                render_page = 'registration/error'
                break;
        }
        res.render(render_page, {
            data: req.session
        });
    }else if(action=='back'){
        render_page = "registration/page" + (page - 1);
        res.render(render_page, {
            data: req.session
        });
    }else if(action=='cancel' || action=='create'){
        if(action=='create'){
            data = helper.clean(req.session);
            console.log(JSON.stringify(data));

            entries.push(data);

            res.cookie('fname', data.fname, {
                maxAge: 60*60*1000, 
                httpOnly: true
            });
            res.cookie('lname', data.lname, {
                maxAge: 60*60*1000, 
                httpOnly: true,
            });
        }

        req.session.destroy();
        res.redirect('/');
    }
});

app.all('/post_coder', method_not_allowed);

app.get("/get_coders", function(req, res){
	data = helper.clean(req.query);

    if(!helper.is_valid_query(data)){
        res.status(400).send('400 - The server did not understand the request. Please check the query parameters.');
        return;
    }

    var filtered = helper.filterEntries(data, entries);

    res.render('coders', {
    	user_agent: req.headers['user-agent'].toLowerCase(),
    	entries: filtered,
    	data: data
    });
});

app.all('/get_coders', method_not_allowed);

app.get('*', function(req, res){
    res.status(404).send('404 - The server can not find the requested page.');
});

app.use(function(err, req, res, next) {
    res.status(500).send('500 - The request was not completed. The server met an unexpected condition.');
});

var server = app.listen(port, function () {
	var host = server.address().address;
	var port = server.address().port;
	console.log("Now listening at Host=" + host + " & Port=" +port);
})