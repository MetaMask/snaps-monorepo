"use strict";module.exports = validate20;module.exports.default = validate20;const schema22 = {"title":"Snap Manifest","description":"The Snap manifest file MUST be named `snap.manifest.json` and located in the package root directory.","type":"object","additionalProperties":false,"required":["version","proposedName","source","initialPermissions","manifestVersion"],"properties":{"version":{"description":"MUST be a valid SemVer version string and equal to the corresponding `package.json` field.","type":"string","pattern":"^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$"},"description":{"description":"MUST be a non-empty string less than or equal to 280 characters. A short description of the Snap.","type":"string","minLength":1,"maxLength":280},"proposedName":{"description":"MUST be a string less than or equal to 214 characters. The Snap author's proposed name for the Snap. The Snap host application may display this name unmodified in its user interface. The proposed name SHOULD be human-readable.","type":"string","minLength":1,"maxLength":214},"repository":{"type":"object","additionalProperties":false,"description":"MAY be omitted. If present, MUST be equal to the corresponding package.json field.","required":["type","url"],"properties":{"type":{"type":"string","enum":["git"]},"url":{"type":"string","minLength":1}}},"source":{"type":"object","description":"Specifies some Snap metadata and where to fetch the Snap during installation.","additionalProperties":false,"required":["shasum","location"],"properties":{"shasum":{"type":"string","description":"MUST be the Base64-encoded string representation of the SHA-256 hash of the Snap source file.","minLength":44,"maxLength":44,"pattern":"^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$"},"location":{"type":"object","additionalProperties":false,"required":["npm"],"properties":{"npm":{"type":"object","additionalProperties":false,"required":["filePath","packageName","registry"],"properties":{"filePath":{"type":"string","minLength":1},"packageName":{"type":"string","minLength":1},"registry":{"type":"string","enum":["https://registry.npmjs.org"]}}}}}}},"initialPermissions":{"type":"object","description":"MUST be a valid EIP-2255 wallet_requestPermissions parameter object, specifying the initial permissions that will be requested when the Snap is added to the host application."},"manifestVersion":{"type":"string","description":"The Snap manifest specification version targeted by the manifest.","enum":["0.1"]}}};const pattern0 = new RegExp("^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$", "u");const pattern1 = new RegExp("^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$", "u");const func8 = require("ajv/dist/runtime/ucs2length").default;const func0 = require("ajv/dist/runtime/equal").default;function validate20(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){let vErrors = null;let errors = 0;if(errors === 0){if(data && typeof data == "object" && !Array.isArray(data)){let missing0;if((((((data.version === undefined) && (missing0 = "version")) || ((data.proposedName === undefined) && (missing0 = "proposedName"))) || ((data.source === undefined) && (missing0 = "source"))) || ((data.initialPermissions === undefined) && (missing0 = "initialPermissions"))) || ((data.manifestVersion === undefined) && (missing0 = "manifestVersion"))){validate20.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];return false;}else {const _errs1 = errors;for(const key0 in data){if(!(((((((key0 === "version") || (key0 === "description")) || (key0 === "proposedName")) || (key0 === "repository")) || (key0 === "source")) || (key0 === "initialPermissions")) || (key0 === "manifestVersion"))){validate20.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];return false;break;}}if(_errs1 === errors){if(data.version !== undefined){let data0 = data.version;const _errs2 = errors;if(errors === _errs2){if(typeof data0 === "string"){if(!pattern0.test(data0)){validate20.errors = [{instancePath:instancePath+"/version",schemaPath:"#/properties/version/pattern",keyword:"pattern",params:{pattern: "^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$"},message:"must match pattern \""+"^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$"+"\""}];return false;}}else {validate20.errors = [{instancePath:instancePath+"/version",schemaPath:"#/properties/version/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}}var valid0 = _errs2 === errors;}else {var valid0 = true;}if(valid0){if(data.description !== undefined){let data1 = data.description;const _errs4 = errors;if(errors === _errs4){if(typeof data1 === "string"){if(func8(data1) > 280){validate20.errors = [{instancePath:instancePath+"/description",schemaPath:"#/properties/description/maxLength",keyword:"maxLength",params:{limit: 280},message:"must NOT have more than 280 characters"}];return false;}else {if(func8(data1) < 1){validate20.errors = [{instancePath:instancePath+"/description",schemaPath:"#/properties/description/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"}];return false;}}}else {validate20.errors = [{instancePath:instancePath+"/description",schemaPath:"#/properties/description/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}}var valid0 = _errs4 === errors;}else {var valid0 = true;}if(valid0){if(data.proposedName !== undefined){let data2 = data.proposedName;const _errs6 = errors;if(errors === _errs6){if(typeof data2 === "string"){if(func8(data2) > 214){validate20.errors = [{instancePath:instancePath+"/proposedName",schemaPath:"#/properties/proposedName/maxLength",keyword:"maxLength",params:{limit: 214},message:"must NOT have more than 214 characters"}];return false;}else {if(func8(data2) < 1){validate20.errors = [{instancePath:instancePath+"/proposedName",schemaPath:"#/properties/proposedName/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"}];return false;}}}else {validate20.errors = [{instancePath:instancePath+"/proposedName",schemaPath:"#/properties/proposedName/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}}var valid0 = _errs6 === errors;}else {var valid0 = true;}if(valid0){if(data.repository !== undefined){let data3 = data.repository;const _errs8 = errors;if(errors === _errs8){if(data3 && typeof data3 == "object" && !Array.isArray(data3)){let missing1;if(((data3.type === undefined) && (missing1 = "type")) || ((data3.url === undefined) && (missing1 = "url"))){validate20.errors = [{instancePath:instancePath+"/repository",schemaPath:"#/properties/repository/required",keyword:"required",params:{missingProperty: missing1},message:"must have required property '"+missing1+"'"}];return false;}else {const _errs10 = errors;for(const key1 in data3){if(!((key1 === "type") || (key1 === "url"))){validate20.errors = [{instancePath:instancePath+"/repository",schemaPath:"#/properties/repository/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"}];return false;break;}}if(_errs10 === errors){if(data3.type !== undefined){let data4 = data3.type;const _errs11 = errors;if(typeof data4 !== "string"){validate20.errors = [{instancePath:instancePath+"/repository/type",schemaPath:"#/properties/repository/properties/type/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}if(!(data4 === "git")){validate20.errors = [{instancePath:instancePath+"/repository/type",schemaPath:"#/properties/repository/properties/type/enum",keyword:"enum",params:{allowedValues: schema22.properties.repository.properties.type.enum},message:"must be equal to one of the allowed values"}];return false;}var valid1 = _errs11 === errors;}else {var valid1 = true;}if(valid1){if(data3.url !== undefined){let data5 = data3.url;const _errs13 = errors;if(errors === _errs13){if(typeof data5 === "string"){if(func8(data5) < 1){validate20.errors = [{instancePath:instancePath+"/repository/url",schemaPath:"#/properties/repository/properties/url/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"}];return false;}}else {validate20.errors = [{instancePath:instancePath+"/repository/url",schemaPath:"#/properties/repository/properties/url/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}}var valid1 = _errs13 === errors;}else {var valid1 = true;}}}}}else {validate20.errors = [{instancePath:instancePath+"/repository",schemaPath:"#/properties/repository/type",keyword:"type",params:{type: "object"},message:"must be object"}];return false;}}var valid0 = _errs8 === errors;}else {var valid0 = true;}if(valid0){if(data.source !== undefined){let data6 = data.source;const _errs15 = errors;if(errors === _errs15){if(data6 && typeof data6 == "object" && !Array.isArray(data6)){let missing2;if(((data6.shasum === undefined) && (missing2 = "shasum")) || ((data6.location === undefined) && (missing2 = "location"))){validate20.errors = [{instancePath:instancePath+"/source",schemaPath:"#/properties/source/required",keyword:"required",params:{missingProperty: missing2},message:"must have required property '"+missing2+"'"}];return false;}else {const _errs17 = errors;for(const key2 in data6){if(!((key2 === "shasum") || (key2 === "location"))){validate20.errors = [{instancePath:instancePath+"/source",schemaPath:"#/properties/source/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key2},message:"must NOT have additional properties"}];return false;break;}}if(_errs17 === errors){if(data6.shasum !== undefined){let data7 = data6.shasum;const _errs18 = errors;if(errors === _errs18){if(typeof data7 === "string"){if(func8(data7) > 44){validate20.errors = [{instancePath:instancePath+"/source/shasum",schemaPath:"#/properties/source/properties/shasum/maxLength",keyword:"maxLength",params:{limit: 44},message:"must NOT have more than 44 characters"}];return false;}else {if(func8(data7) < 44){validate20.errors = [{instancePath:instancePath+"/source/shasum",schemaPath:"#/properties/source/properties/shasum/minLength",keyword:"minLength",params:{limit: 44},message:"must NOT have fewer than 44 characters"}];return false;}else {if(!pattern1.test(data7)){validate20.errors = [{instancePath:instancePath+"/source/shasum",schemaPath:"#/properties/source/properties/shasum/pattern",keyword:"pattern",params:{pattern: "^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$"},message:"must match pattern \""+"^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$"+"\""}];return false;}}}}else {validate20.errors = [{instancePath:instancePath+"/source/shasum",schemaPath:"#/properties/source/properties/shasum/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}}var valid2 = _errs18 === errors;}else {var valid2 = true;}if(valid2){if(data6.location !== undefined){let data8 = data6.location;const _errs20 = errors;if(errors === _errs20){if(data8 && typeof data8 == "object" && !Array.isArray(data8)){let missing3;if((data8.npm === undefined) && (missing3 = "npm")){validate20.errors = [{instancePath:instancePath+"/source/location",schemaPath:"#/properties/source/properties/location/required",keyword:"required",params:{missingProperty: missing3},message:"must have required property '"+missing3+"'"}];return false;}else {const _errs22 = errors;for(const key3 in data8){if(!(key3 === "npm")){validate20.errors = [{instancePath:instancePath+"/source/location",schemaPath:"#/properties/source/properties/location/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key3},message:"must NOT have additional properties"}];return false;break;}}if(_errs22 === errors){if(data8.npm !== undefined){let data9 = data8.npm;const _errs23 = errors;if(errors === _errs23){if(data9 && typeof data9 == "object" && !Array.isArray(data9)){let missing4;if((((data9.filePath === undefined) && (missing4 = "filePath")) || ((data9.packageName === undefined) && (missing4 = "packageName"))) || ((data9.registry === undefined) && (missing4 = "registry"))){validate20.errors = [{instancePath:instancePath+"/source/location/npm",schemaPath:"#/properties/source/properties/location/properties/npm/required",keyword:"required",params:{missingProperty: missing4},message:"must have required property '"+missing4+"'"}];return false;}else {const _errs25 = errors;for(const key4 in data9){if(!(((key4 === "filePath") || (key4 === "packageName")) || (key4 === "registry"))){validate20.errors = [{instancePath:instancePath+"/source/location/npm",schemaPath:"#/properties/source/properties/location/properties/npm/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key4},message:"must NOT have additional properties"}];return false;break;}}if(_errs25 === errors){if(data9.filePath !== undefined){let data10 = data9.filePath;const _errs26 = errors;if(errors === _errs26){if(typeof data10 === "string"){if(func8(data10) < 1){validate20.errors = [{instancePath:instancePath+"/source/location/npm/filePath",schemaPath:"#/properties/source/properties/location/properties/npm/properties/filePath/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"}];return false;}}else {validate20.errors = [{instancePath:instancePath+"/source/location/npm/filePath",schemaPath:"#/properties/source/properties/location/properties/npm/properties/filePath/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}}var valid4 = _errs26 === errors;}else {var valid4 = true;}if(valid4){if(data9.packageName !== undefined){let data11 = data9.packageName;const _errs28 = errors;if(errors === _errs28){if(typeof data11 === "string"){if(func8(data11) < 1){validate20.errors = [{instancePath:instancePath+"/source/location/npm/packageName",schemaPath:"#/properties/source/properties/location/properties/npm/properties/packageName/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"}];return false;}}else {validate20.errors = [{instancePath:instancePath+"/source/location/npm/packageName",schemaPath:"#/properties/source/properties/location/properties/npm/properties/packageName/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}}var valid4 = _errs28 === errors;}else {var valid4 = true;}if(valid4){if(data9.registry !== undefined){let data12 = data9.registry;const _errs30 = errors;if(typeof data12 !== "string"){validate20.errors = [{instancePath:instancePath+"/source/location/npm/registry",schemaPath:"#/properties/source/properties/location/properties/npm/properties/registry/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}if(!(data12 === "https://registry.npmjs.org")){validate20.errors = [{instancePath:instancePath+"/source/location/npm/registry",schemaPath:"#/properties/source/properties/location/properties/npm/properties/registry/enum",keyword:"enum",params:{allowedValues: schema22.properties.source.properties.location.properties.npm.properties.registry.enum},message:"must be equal to one of the allowed values"}];return false;}var valid4 = _errs30 === errors;}else {var valid4 = true;}}}}}}else {validate20.errors = [{instancePath:instancePath+"/source/location/npm",schemaPath:"#/properties/source/properties/location/properties/npm/type",keyword:"type",params:{type: "object"},message:"must be object"}];return false;}}}}}}else {validate20.errors = [{instancePath:instancePath+"/source/location",schemaPath:"#/properties/source/properties/location/type",keyword:"type",params:{type: "object"},message:"must be object"}];return false;}}var valid2 = _errs20 === errors;}else {var valid2 = true;}}}}}else {validate20.errors = [{instancePath:instancePath+"/source",schemaPath:"#/properties/source/type",keyword:"type",params:{type: "object"},message:"must be object"}];return false;}}var valid0 = _errs15 === errors;}else {var valid0 = true;}if(valid0){if(data.initialPermissions !== undefined){let data13 = data.initialPermissions;const _errs32 = errors;if(!(data13 && typeof data13 == "object" && !Array.isArray(data13))){validate20.errors = [{instancePath:instancePath+"/initialPermissions",schemaPath:"#/properties/initialPermissions/type",keyword:"type",params:{type: "object"},message:"must be object"}];return false;}var valid0 = _errs32 === errors;}else {var valid0 = true;}if(valid0){if(data.manifestVersion !== undefined){let data14 = data.manifestVersion;const _errs34 = errors;if(typeof data14 !== "string"){validate20.errors = [{instancePath:instancePath+"/manifestVersion",schemaPath:"#/properties/manifestVersion/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}if(!(data14 === "0.1")){validate20.errors = [{instancePath:instancePath+"/manifestVersion",schemaPath:"#/properties/manifestVersion/enum",keyword:"enum",params:{allowedValues: schema22.properties.manifestVersion.enum},message:"must be equal to one of the allowed values"}];return false;}var valid0 = _errs34 === errors;}else {var valid0 = true;}}}}}}}}}}else {validate20.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];return false;}}validate20.errors = vErrors;return errors === 0;}