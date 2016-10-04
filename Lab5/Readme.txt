README
SER422 Spring 2016 Lab5

Dependencies:
express
body-parser
cookie-parser
express-session
mongoose
EJS


1) Task1:

Part1:
- User is remembered using “Cookies”.
- If new user, then he will be redirected to the multi-page registration form.

Part2:
- On click of “CREATE” button, new cookies will be created.
- Session destroyed at end of workflow.

Part3:
- 400 (wrong query parameters) can be tested using “get_coders”.
- 404 (page not found) can be tested by writing wrong url.
- 405 (method not allowed) can be tested by sending GET request to “post_coder”.
- 500 (internal server error)


2) Task2:
MongoDB is used as a persistent data store.
