var circular = {
	version: "0.0.3",
	currentId: 1,
	showWarnings: false,
	classes: {}
};

module.exports = circular;

/**
 * All classes for Circular objects should be registered
 * 
 * TODO: Mark as deprecated, rename to registerType, document that class_ is optional
 */
circular.registerClass = function(typeId, class_, metadata){
	if (!metadata)
		metadata = {};
	metadata.prototype = class_
	circular.classes[typeId] = metadata;
};

/**
 * Used to create an object's _c attribute for
 * an object that requires circular serialization.
 */
circular.register = function(type){
	return {
		type: type,
		uid: circular.currentId++
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

/**
 * Rebuilds the original object using the classes metadata and
 * the references table.
 */
circular.parse = function(json, reviverData){
	var serializedObject = JSON.parse(json);
	var objectMap = [];
	return circular._deserializeObject(serializedObject.object, serializedObject.references, objectMap, reviverData);
};


circular._serializeObject = function (object, objectMap){
	var serializableObject = null;
	if (circular.isArray(object)){
		serializableObject = new Array();
	} else {
		serializableObject = {};
	}
	if (!object._c && !circular.isArray(object)){
		console.log(object);
		throw "ERROR: "+(typeof object)+" without Circular metadata...";
	} else if (!circular.isArray(object)){
		// Reference the serialized object in the object map
		objectMap["x"+object._c.uid] = serializableObject;
		circular._prepareObject(object);
	}
	for (var component in object){
		var componentName = component;
		var attribute = object[componentName];
		if (!circular.isArray(object) && circular._isTransient(object._c.type, componentName)){
			// Skip transient attributes
			continue;
		} else if (typeof attribute == 'function'){
			// Functions are not saved
			continue;
		} else if (componentName === '_c'){
			// Circular metadata is saved verbatim
			serializableObject[componentName] = attribute;
		} else if (circular.isArray(attribute)){
			// Arrays are always serialized, no need to check for metadata
			serializableObject[componentName] = circular._serializeObject(attribute, objectMap);
		} else if (attribute == null || typeof attribute !== "object"){
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
				if (object._c){
					throw "ERROR: "+componentName+" attribute from circular type "+object._c.type+" has no Circular metadata";
				} else {
					throw "ERROR: ["+componentName+"] attribute from non circular object has no Circular metadata";
				}
			}
		}
	}
	if (!circular.isArray(object)){
		circular._cleanupObject(object);
	}
	return serializableObject;
};

circular._isTransient = function(type, attributeName) {
	return circular.classes[type] && circular.classes[type].transients && circular.classes[type].transients[attributeName];
};

circular._prepareObject = function(object) {
	var type = object._c.type
	if (circular.classes[type] && circular.classes[type].prepare) {
		object.__serialData = circular.classes[type].prepare(object);
		object.__serialData._c = this.setSafe();
	}
}

circular._cleanupObject = function(object) {
	var type = object._c.type
	if (circular.classes[type] && circular.classes[type].prepare) {
		delete object.__serialData;
	}
}

circular._deserializeObject = function (object, references, objectMap, reviverData){
	var deserializedObject = null;
	if (circular.isArray(object)){
		deserializedObject = [];
	} else if (object._c){
		if (circular.classes[object._c.type] && circular.classes[object._c.type].prototype){
			deserializedObject = new circular.classes[object._c.type].prototype();
		} else {
			deserializedObject = {};
		}
		objectMap["x"+object._c.uid] = deserializedObject;
		if (object._c.uid > circular.currentId){
			// Update the circular currentId index, to avoid new objects to overlap with existing for future cerealizations
			circular.currentId = object._c.uid;
		}
	}
	for (var component in object){
		var componentName = component;
		var attribute = object[componentName]; 
		if (componentName === '_c'){
			deserializedObject[componentName] = object[componentName];
			// Circular metadata is restored verbatim
		} else if (circular.isArray(attribute)){
			deserializedObject[componentName] = circular._deserializeObject(attribute, references, objectMap, reviverData);
		} else if (
			attribute &&
			typeof attribute == "object" &&
			attribute.type && 
			attribute.uid){
			if (!objectMap["x"+attribute.uid]){
				circular._deserializeObject(references["x"+attribute.uid], references, objectMap, reviverData);
			}
			deserializedObject[componentName] = objectMap["x"+attribute.uid];
		} else {
			deserializedObject[componentName] = attribute;
		}
	}
	if (object._c && circular.classes[object._c.type] && circular.classes[object._c.type].reviver){
		circular.classes[object._c.type].reviver(deserializedObject, reviverData);
	}
	return deserializedObject;
};

circular.isArray = function (object){
	return Object.prototype.toString.call( object ) === '[object Array]';
}
