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
	circular.setTransient('Person', 'age');
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