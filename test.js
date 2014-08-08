circular.test = function(){
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
	console.log("Original Data");
	console.log(people);
	var serialized = circular.serialize(people);
	console.log("Serialized Data");
	console.log(JSON.parse(serialized));
	var deserialized = circular.parse(serialized);
	console.log("De-cerealized Data");
	console.log(deserialized);
};


circular.testReviversAndTransients = function(){
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
	console.log("Original Data");
	console.log(people);
	var serialized = circular.serialize(people);
	console.log("Serialized Data");
	console.log(JSON.parse(serialized));
	var personList = new Array();
	var deserialized = circular.parse(serialized, personList);
	console.log("De-cerealized Data");
	console.log(deserialized);
	console.log("Reviver Data");
	console.log(personList);
};

circular.runTests = function(){
	console.log("Running Test 1");
	circular.test();
	console.log("Running Test 2");
	circular.testReviversAndTransients();
}