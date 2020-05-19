import {
	OBJLoader
} from '../lib/OBJLoader.js'

let objloader = false


export default (function(){

	if( objloader ) return objloader

	objloader = new OBJLoader()

	return objloader

})()