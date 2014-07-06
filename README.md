## Synopsis

CircularJS is a library that serializes complex javascript objects with cyclic references, something that JSON.stringify can't do.

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

It also allows marking a field as transient:

```
circular.setTransient('Object Type', 'transientField');
```

## Motivation

Sometimes you just need to serialize complex objects, for example to save the state of a JavaScript game.

## Installation

Just reference circular.js from your project.

## API Reference

PENDING

## Tests

Run circular.test();

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
