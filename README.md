## Synopsis

CircularJS is a library that serializes complex networks of javascript objects with cyclic references, something that JSON.stringify can't do.

There are already some libraries allowing to serialized objects with cyclic references, but circularJS allows you to deserialize them including
the functions they had, so they are ready to be used as objects with behavior.

A tutorial is available at https://blog.slashie.net/2014/08/08/circularjs-1-1-tutorial/

## Code Example

```
var serialized = circular.serialize(object); // "object" is a complex JS object with cyclic relationships  
localStorage.setItem('object', serialized); // Or do what you need with the serialized data
console.log(JSON.parse(serialized)); // Check what the serialized object looks like
var deserialized = circular.parse(serialized); // Magic happens
```
	
In order to serialize an object, you need to add a "_c" attribute to it, there is a helper function for that:
```
var complexSerializableObject = {
        _c: circular.register('Object Type');
}
```
 
If you are using classes, you should add that call to the constructor, ie:
```
function Person(name, phone){
	this.name = name;
	this.phone = phone;
	this._c = circular.register('Person');
}
```

Or, if you are absolutely sure the object won't have cycling relationships (and to save memory)
```
var simpleSerializableObject = {
       _c: circular.setSafe();
}
```

If you are using classes, you should register them along with optional metadata so that they are restored in a functional way, as follows:

```
circular.registerClass('Person', Person, {
   reviver: reviverFunction, // optional, this function is invoked when parsing
   transients: {
      transientField1: true // optional, allows you to specify fields that should not be serialized
   }
});
```

## Motivation

Games, and other kind of JavaScript apps, often have complex structures of linked objects in memory that you'd 
eventually want to serialize for persistence, be it to save the game, or to keep complex user preferences, or whatnot.

Modern browsers have the JSON.stringify and JSON.parse methods, and they work great for simple objects, but the moment you want 
to use them for a complex object you'll get a TypeError.

The reason for this is that once the stringify method detects an object has a reference to another object it has already stringified, 
it will panic since processing it risks ending up in an infinite process, given that that object might then indirectly reference 
the object that's currently being stringified!

CircularJS allows you to circumvent this issue by generating a table of references and flattening the objects so that they 
only keep a reference to that table, then you can safely serialize the base object and the table, and use that data to deserialize it back!

There are already some libraries allowing to serialized objects with cyclic references, but circularJS allows you to deserialize them including
the functions they had, so they are ready to be used as objects with behavior.

## Installation

You can use circular-browser.js directly in your browser, otherwise require('circular-functions') from npm.

## API Reference

Check out the tutorial (tutorial.html) or tests.js for the very easy to use examples.

## Tests

Run node test or just open circularTest.html

## Contributors

Created by @slashie_

## License

The MIT License (MIT)

Copyright (c) 2014 Santiago Zapata

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
