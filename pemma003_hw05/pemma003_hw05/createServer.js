
const http = require('http');
const url = require('url');
const fs = require('fs');
const qs = require('querystring');

const port = 9001;
http.createServer(function (req, res) {
  var q = url.parse(req.url, true);
  var filename = "." + q.pathname;
  if(req.url === '/'){
    indexPage(req,res);
  }
  else if(req.url === '/index.html'){
    indexPage(req,res);
  }
  else if(req.url === '/contacts.html'){
    contactPage(req,res);
  }
  else if(req.url === '/contacts.json'){
    contactJsonFunc(req,res);
  }
  else if(req.url === '/postContactEntry'){
    postFunction(req,res);
  }
  else if(req.url === '/addContact.html'){
    addcontactPage(req,res);
  }
  else if(req.url === '/stock.html'){
    stockPage(req,res);
  }
  else{
    res.writeHead(404, {'Content-Type': 'text/html'});
    return res.end("404 Not Found");
  }
}).listen(port);


function indexPage(req, res) {
  fs.readFile('client/index.html', function(err, html) {
    if(err) {
      throw err;
    }
    res.statusCode = 200;
    res.setHeader('Content-type', 'text/html');
    res.write(html);
    res.end();
  });
}

function contactPage(req, res) {
  fs.readFile('client/contacts.html', function(err, html) {
    if(err) {
      throw err;
    }
    res.statusCode = 200;
    res.setHeader('Content-type', 'text/html');
    res.write(html);
    res.end();
  });
}

function addcontactPage(req, res) {
  fs.readFile('client/addContact.html', function(err, html) {
    if(err) {
      throw err;
    }
    res.statusCode = 200;
    res.setHeader('Content-type', 'text/html');
    res.write(html);
    res.end();
  });
}

function stockPage(req, res) {
  fs.readFile('client/stock.html', function(err, html) {
    if(err) {
      throw err;
    }
    res.statusCode = 200;
    res.setHeader('Content-type', 'text/html');
    res.write(html);
    res.end();
  });
}

function contactJsonFunc(req, res){
  fs.readFile('contacts.json', function(err, html) {
     if(err) {
       throw err;
     }
     jObj = JSON.parse(html);
     var response = {res:jObj};
     res.statusCode = 200;
     res.setHeader('Content-type', 'application/json');
     res.write(JSON.stringify(response));
     res.end();
  });
}

function postFunction(req, res){
  let data = '';
  req.on('data', chunk => {
    data += chunk;
  })
  req.on('end', () => {
    var newContact = qs.parse(data);
    fs.readFile('contacts.json', function(err, html) {
     if(err) {
       throw err;
     }
     jObj = JSON.parse(html);
     jObj['contacts'].push(newContact);
     fs.writeFile('contacts.json', JSON.stringify(jObj), (err) => {
        if (err) {
          throw err;
        } 
        res.statusCode = 302;
        res.setHeader('Location', '/contacts.html');
        res.end();
     });
    });
  })
}