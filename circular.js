/**
 * Base circular object. 
 */
var circular = {
	currentId: 1,
	transients: {},
	reviverFunctions: {}
};

circular.setReviver = function(typeId, reviverFunction){
	circular.reviverFunctions[typeId] = reviverFunction;
};

/**
 * Used to create an object's _c attribute for
 * an object that requires circular serialization.
 */
circular.register = function(type){
	return {
		type: type,
		uid: circular.getUID()
	};
};

/**
 * Used to create an object's _c attribute for
 * an object that doesn't require circular 
 * serialization.
 */
circular.setSafe = function(){
	return {
		isCircularSafe: true
	};
};

circular.getUID = function(){
	return circular.currentId++;
};

circular.setTransient = function(type, attributeName) {
	if (!circular.transients[type]){
		circular.transients[type] = {};
	}
	circular.transients[type][attributeName] = true;
};

circular.isTransient = function(type, attributeName) {
	return circular.transients[type] && circular.transients[type][attributeName];
};

/**
 * Returns a serialized version of the object, replacing all
 * object fields to pointers to a master table.
 */
circular.serialize = function (object){
	var objectMap = {};
	var serializableObject = circular._serializeObject(object, objectMap);
	var returnData = {
		object: serializableObject,
		references: objectMap
	};
	return JSON.stringify(returnData);
};

circular._serializeObject = function (object, objectMap){
	var serializableObject = null;
	if (isArray(object)){
		serializableObject = new Array();
	} else {
		serializableObject = {};
	}
	if (!object._c && !isArray(object)){
		console.log(object);
		throw "ERROR: "+(typeof object)+" without Circular metadata...";
	} else if (!isArray(object)){
		// Reference the serialized object in the object map
		objectMap["x"+object._c.uid] = serializableObject;
	}
	for (component in object){
		var componentName = component;
		var attribute = object[componentName];
		if (!isArray(object) && circular.isTransient(object._c.type, componentName)){
			// Skip transient attributes
			continue;
		} else if (typeof attribute == 'function'){
			// Functions are not saved
			continue;
		} else if (componentName === '_c'){
			// Circular metadata is saved verbatim
			serializableObject[componentName] = attribute;
		} else if (isArray(attribute)){
			// Arrays as saved as arrays but their contents are serialized
			serializableObject[componentName] = [];
			for (var i = 0; i < attribute.length; i++){
				try {
					serializableObject[componentName][i] = circular._serializeObject(attribute[i], objectMap);
				} catch (error){
					if (typeof error == 'string' && error.indexOf("...", error.length - 3) !== -1)
						throw error +", on Array "+componentName+" on circular type "+object._c.type+".";
				}
			}
		} else if (typeof attribute !== "object"){
			// Native values are saved verbatim
			serializableObject[componentName] = attribute;
		} else {
			// An Object that might be serialized
			if (attribute._c){
				if (attribute._c.isCircularSafe){
					serializableObject[componentName] = object[componentName];
				} else {
					if (!objectMap["x"+attribute._c.uid]){
						objectMap["x"+attribute._c.uid] = circular._serializeObject(attribute, objectMap);
					}
					serializableObject[componentName] = attribute._c;
				}
			} else {
				throw "ERROR: "+componentName+" attribute from circular type "+object._c.type+" has no Circular metadata";
			}
		}
	}
	return serializableObject;
};

circular.parse = function(json, reviverData){
	var serializedObject = JSON.parse(json);
	var objectMap = [];
	return circular._deserializeObject(serializedObject.object, serializedObject.references, objectMap, reviverData);
};

circular._deserializeObject = function (object, references, objectMap, reviverData){
	var deserializedObject = null;
	if (isArray(object)){
		deserializedObject = [];
	} else {
		deserializedObject = {};
	}
	if (object._c)
		objectMap["x"+object._c.uid] = deserializedObject;
	for (component in object){
		var componentName = component;
		var attribute = object[componentName]; 
		if (componentName === '_c'){
			deserializedObject[componentName] = object[componentName];
			// Circular metadata is restored verbatim
		} else if (
			typeof attribute == "object" && 
			!isArray(attribute) &&
			attribute.type && 
			attribute.uid){
			if (!objectMap["x"+attribute.uid]){
				circular._deserializeObject(references["x"+attribute.uid], references, objectMap, reviverData);
			}
			deserializedObject[componentName] = objectMap["x"+attribute.uid];
			if (circular.reviverFunctions[attribute.type]){
				circular.reviverFunctions[attribute.type](deserializedObject[componentName], reviverData);
			}
		} else {
			deserializedObject[componentName] = object[componentName];
		}
	}
	return deserializedObject;
};

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

function isArray(object){
	return Object.prototype.toString.call( object ) === '[object Array]';
}