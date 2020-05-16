import {
	Vector3,
	Quaternion,
	BufferGeometry,

} from './lib/three.module.js'

import GLTF from './three/GLTF.js'
import BuffGeoLoader from './three/BuffGeoLoader.js'
import ObjectLoader from './three/ObjectLoader.js'





function radians_to_degrees( radians ){
	return radians * (180/ Math.PI )
}

function degrees_to_radians( degrees ){
	return degrees * ( Math.PI /180)
}

			
			
function random_hex( len ){

	//	let r = '#' + Math.floor( Math.random() * 16777215 ).toString(16)
	let s = ''
	
	for( let i = 0; i < len; i++){
		
		s += Math.floor( Math.random() * 16 ).toString( 16 )

	}
	
	return s

}


function load( type, filepath ){

	return new Promise((resolve, reject)=>{

		switch ( type ){

			case 'buffer_geometry':
				BuffGeoLoader.load( filepath, 
				( obj ) => {
					resolve( obj )
				}, (xhr) => {
					// console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' )
				}, ( error ) => {
					console.log('error loading model: ', error, filepath )
					reject( 'model not found' )
				})

				break;

			case 'gltf':
				GLTF.load( filepath, 
				( obj ) => {
					resolve( obj )
				}, (xhr) => {
					// console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' )
				}, ( error ) => {
					console.log('error loading model: ', error, filepath )
					reject( 'model not found' )
				})

				break;

			case 'json':
				ObjectLoader.load( filepath, 
				( obj ) => {
					resolve( obj )
				}, (xhr) => {
					// console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' )
				}, ( error ) => {
					console.log('error loading model: ', error, filepath )
					reject( 'model not found' )
				})
				break;

			default: 
				reject('invalid model file request')
				break;

		}

	})

}




export {
	random_hex,
	degrees_to_radians,
	radians_to_degrees,
	load
	// clear_object
}