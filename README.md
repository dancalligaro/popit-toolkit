Popit Toolkit
=============

Utility library for populating your Popit instance.

This node module contains some functions used to interact with Popit instances.

In particular, it provides a way for inserting large sets of items and also getting all the items in any one of the collections. 

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


// To get all the items in the persons collection

toolkit.loadAllItems('persons').then(
	function(persons){ 
		console.log('total persons', persons.length)
	}, 
	function(err){
		console.log('error', err);
	}, 
	function(progress){
		console.log(progress); //This will bring information about the number of 'pages' that will be retrieved to get the complete collection.
	}
);


```

Why should I use this?
----------------------

Insert faster: if you need to insert 2000 records, it can take a while to insert them sequentially. Also, if you open 2000 simultaneous connections time-outs may ocurr. This library will issue 50 simultaneous requests max. Once any of those 50 slots gets freed only then a new request will be sent. 

Retrieve faster: the api will list results in a paginated fashion, 200 items per page max. If you want to retrieve all the records in a collection, the naive implementation may request page after page until the `has_more` property is false. Instead, this library will calculate the number of pages and request all the pages simultaneously. For long round-trip times, this makes a difference.


Function Reference
------------------

.config(configOptions)

This method initializes the library and sets the credentials that will be used for writing to the API.

```javascript
configOptions = {
	host: 'cargografias.popit.mysociety.org', 
	user: 'username',       // optional if not going to write to the api
	password: 'password'    // optional if not going to write to the api	
}
```

collectionType: can be one of these 4 values -> [ 'persons', 'organizations', 'posts', 'memberships' ]

```javascript
.postItems(collectionType, itemsToPost).then(successCallback, errorCallback, progressCallack)
```

```javascript
.loadAllItems(collectionType).then(successCallback, errorCallback, progressCallack)
```
