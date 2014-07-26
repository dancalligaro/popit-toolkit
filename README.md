Popit Toolkit
=============

Utility library for populating your Popit instance.

This node module contains some functions used to interact with Popit instances.

In particular, it provides a way for inserting large sets of items and also getting all the items in any of the collections. 

Installation
------------

`npm install popit-toolkit`

Usage
-----

```javascript

var toolkit = require('popit-toolkit');

// Set initial values & config

toolkit.config({
	host: 'cargografias.popit.mysociety.org', 
	user: 'username',       // optional if not going to write to the api
	password: 'password'    // optional if not going to write to the api
});


// To batch insert organizations

var itemsToPost = [];

itemsToPost.push({ name : "Organization 1" });
itemsToPost.push({ name : "Organization 2" });


toolkit.postItems('organizations', itemsToPost).then(
	function(){
		console.log('all requests POSTed to the server');
	},
	function(err){
		console.log('error', err);
	},
	function(progress){
		// progress will contain the server response for each POSTed item. (as string)
		console.log(progres);
	}
);



// To get all the persons

toolkit.loadAllItems('persons').then(function(persons){ 
	console.log('total persons', persons.length)
}, function(err){
	console.log('error', err);
}, function(progress){
	console.log(progress); //This will bring information about the number of 'pages' that will be retrieved to get the complete collection.
});


```

