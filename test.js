var circular = require('./circular');

var circularTests = {
	runTests: function(){
		console.log("Running Test 1");
		circularTests.test();
		console.log("Running Test 2");
		circularTests.testReviversAndTransients();
		console.log("Running Test 3");
		circularTests.testRootReviver();
	},
	test: function(){
		var country = {
			_c: {
				uid: 1,
				type: 'Country'
			},
			name: 'Colombia'
		};
		var people = [{
			_c: {
				uid: 2,
				type: 'Person'
			},
			name: 'Jhon',
			age: 400,
			country: country
		}, {
			_c: {
				uid: 3,
				type: 'Person'
			},
			name: 'Sarah',
			age: 300,
			country: country
		}];
		country.leader = people[0];
		var serialized = circular.serialize(people);
		var deserialized = circular.parse(serialized);
		// Assertions
		var errors = 0;
		errors += assert(people.length === deserialized.length, "people.length === deserialized.length");
		errors += assert(people[0].name === deserialized[0].name, "people[0].name === deserialized[0].name");
		errors += assert(typeof deserialized[0].country != 'undefined', "typeof deserialized[0].country != 'undefined'");
		errors += assert(deserialized[0].country.name === country.name, "deserialized[0].country.name === country.name");
		if (errors){
			console.log(errors+' tests failed.');
		} else {
			console.log('No tests failed.');
		}
	},
	testReviversAndTransients: function(){
		var country = {
			_c: {
				uid: 1,
				type: 'Country'
			},
			name: 'Colombia'
		};
		var Person = function (name, age, country){
			this._c = circular.register('Person');
			this.name = name;
			this.age = age;
			this.country = country;
		}
		
		circular.registerClass('Person', Person, {
			reviver: function(person, reviverData){
				reviverData.push(person);
			},
			transients: {
				age: true
			}
		})
		
		var people = [new Person('Jhon', 400, country), new Person('Sarah', 300, country)];
		country.leader = people[0];
		var serialized = circular.serialize(people);
		var personList = new Array();
		var deserialized = circular.parse(serialized, personList);
		
		var errors = 0;
		errors += assert(personList.length === 2, "personList.length === 2");
		errors += assert(typeof personList[0].country != 'undefined', "typeof personList[0].country != 'undefined'");
		if (errors){
			console.log(errors+' tests failed.');
		} else {
			console.log('No tests failed.');
		}
		
	},
	testRootReviver: function(){
		var Person = function (name){
			this._c = circular.register('Person2');
			this.name = name;
		}
		
		circular.registerClass('Person2', Person, {
			reviver: function(person, reviverData){
				reviverData.push(person);
			},
			transients: {
				age: true
			}
		})
		
		var jhon = new Person('Jhon');
		var serialized = circular.serialize(jhon);
		var personList = new Array();
		var deserialized = circular.parse(serialized, personList);
		
		var errors = 0;
		errors += assert(personList.length === 1, "personList.length === 1");
		if (errors){
			console.log(errors+' tests failed.');
		} else {
			console.log('No tests failed.');
		}
		
	}
}

function assert(condition, message) {
    if (!condition) {
        console.log("Assertion failed: "+message);
        return 1;
    }
    return 0;
}

circularTests.runTests();

module.exports = circularTests;