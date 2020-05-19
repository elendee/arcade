import * as lib from '../lib.js'
import env from '../env.js'

import SCENE from '../three/SCENE.js'
import CAMERA from '../three/CAMERA.js'
import RENDERER from '../three/RENDERER.js'
import * as LIGHT from '../three/LIGHT.js'

import GLOBAL from '../GLOBAL.js'
import TOONS from './TOONS.js'

import User from '../User.js'

import * as KEYS from './ui/KEYS.js'
import * as MOUSE from './ui/MOUSE.js'
import CHAT from './ui/CHAT.js'

import STATE from './STATE.js'

// import SKYBOX from '../three/SKYBOX.js'

import animate from './animate.js'

// import * as ANIMATE from './animate.js'




import {
	Vector3,
	Quaternion,
	PlaneBufferGeometry,
	BoxBufferGeometry,
	MeshLambertMaterial,
	DoubleSide,
	Mesh,
	MeshBasicMaterial,
	Object3D,
	NearestFilter,
	sRGBEncoding,
	Group,
	Box3
} from '../lib/three.module.js'




import texLoader from '../three/texLoader.js'
// import BuffGeoLoader from '../three/texLoader.js'

if( env.EXPOSE ){
	window.SCENE = SCENE
	window.TOONS = TOONS
}



let new_pos, new_quat, old_pos, old_quat, needs_move, needs_rotate

const ground_mat = texLoader.load('/resources/textures/concrete.jpg')

const bbox = new Box3()


class Arcade {
	
	constructor( init ){

		init = init || {}

		for( const key of Object.keys( init )){
			this[ key ] = init[ key ]
		}

		this.intervals = {
			anim_sweeper: false
		}

		this.STRUCTURES = {}
		this.NPCS = {}
		this.TOONS = {}

	}







	initialize(){

		KEYS.init( this )
		MOUSE.init( this )
		CHAT.init()

		SCENE.add( LIGHT.hemispherical )
		SCENE.add( LIGHT.directional )
		LIGHT.directional.position.set( 
			MAP.ZONE_WIDTH * 1.2, 
			400, 
			MAP.ZONE_WIDTH * 1.2 
		)

		const ltarget = new Object3D()
		ltarget.position.set( MAP.ZONE_WIDTH / 2 , 0, MAP.ZONE_WIDTH / 2 )
		SCENE.add( ltarget )
		LIGHT.directional.target = ltarget

		USER.model('self')

		SCENE.add( USER.MODEL )
		// SCENE.add( LIGHT.helper )
		USER.MODEL.position.copy( USER.ref.position )

		// LIGHT.helper.position.copy( USER.MODEL.position )

		USER.MODEL.add( CAMERA )
	    CAMERA.position.set( 0, 0, 0 ).add( CAMERA.offset )
		// CAMERA.position.set( 0, 150, 20 )



		setTimeout(function(){
			// CAMERA.lookAt( window.USER.MODEL.position.clone().add( USER.HEAD.position ) )
			CAMERA.lookAt( USER.MODEL.position ) 

			RENDERER.frame( SCENE )

		}, 100 )

		USER.begin_intervals()

		this.begin_intervals()

		CHAT.begin_pulse()

		if( env.EXPOSE ) window.CAMERA = CAMERA

	}



	render( arcade_data ){

		const arcade = this

		// tiles

		const geometry = new PlaneBufferGeometry( MAP.ZONE_WIDTH, MAP.ZONE_WIDTH, 32 )
		const material = new MeshLambertMaterial({ 
			color: 0x333232, 
			map: ground_mat,
			// side: DoubleSide 
		})

		const ground = new Mesh( geometry, material )
		ground.receiveShadow = true
		ground.rotation.x = -Math.PI / 2
		ground.position.set( MAP.ZONE_WIDTH / 2, 0, MAP.ZONE_WIDTH / 2 )
		SCENE.add( ground )


		// group of 4 machines
		var arcadegroup = new Group()
		// arcadegroup.position.set( MAP.ZONE_WIDTH / 2, 3, MAP.ZONE_WIDTH / 2)
		arcadegroup.position.set( MAP.ZONE_WIDTH / 2, 3, MAP.ZONE_WIDTH / 2)
		SCENE.add( arcadegroup )
		// window.arcadegroup = arcadegroup

		// texture
		const machinetex = texLoader.load('/resources/textures/arcade2c.png')
		machinetex.magFilter = NearestFilter
		machinetex.minFilter = NearestFilter
		machinetex.encoding = sRGBEncoding

		const machine_material = new MeshBasicMaterial({ 
			map: machinetex,
			transparent: true
		})



		// load model
		lib.load('obj', '/resources/geometries/arcade1.obj' )
		.then( group =>{

			add_machine({
				machine: group, 
				material: machine_material, 
				name: 'SPACEBALLS', 
				center: arcadegroup.position,
				offset: {
					x: -10,
					z: -10
				}
			})

		}).catch( err=> { console.log('load err: ', err) } )

		lib.load('obj', '/resources/geometries/arcade2.obj' )
		.then( group =>{

			add_machine({
				machine: group,
				material: new MeshLambertMaterial({
					color: 'rgb(30, 35, 25)'
				}),
				name: 'COWBOP BEBOY',
				center: arcadegroup.position,
				offset: {
					x: -10,
					z: 10
				}
			})

		}).catch( err=> { console.log('load err: ', err) } )

		lib.load('obj', '/resources/geometries/arcade3.obj' )
		.then( group =>{

			add_machine({
				machine: group,
				material: machine_material,
				name: 'KING ARTURO',
				center: arcadegroup.position,
				offset: {
					x: 10,
					z: -10
				}
			})

		}).catch( err=> { console.log('load err: ', err) } )

		lib.load('obj', '/resources/geometries/arcade4.obj' )
		.then( group =>{

			add_machine({
				machine: group,
				material: machine_material,
				name: 'WALK INTO MORDOR',
				center: arcadegroup.position,
				offset: {
					x: 10,
					z: 10
				}
			})

			for( let i = 0; i < 1500; i++ ){

				add_machine({
					machine: group.clone(),
					material: machine_material,
					name: 'GAME_' + Math.random() * 100 / 100 * 100,
					center: arcadegroup.position,
					offset: {
						x: ( i % 40 ) * 10,
						z: Math.floor( i / 40 ) * 10
					}
				})

			}

		}).catch( err=> { console.log('load err: ', err) } )






		// SKYBOX.position.set( MAP.ZONE_WIDTH / 2, 0, MAP.ZONE_WIDTH / 2)
		// window.SKYBOX = SKYBOX 
		// SCENE.add( SKYBOX )



		STATE.animating = true
		animate()

		// RENDERER.frame( SCENE )
		
	}













	begin_intervals(){

		// this.intervals.anim_sweeper = setInterval(function(){

		// 	for( const arc_id of ANIMATE.moving_toons ){
		// 		if( !TOONS[ arc_id ]) ANIMATE.moving_toons.splice( ANIMATE.moving_toons.indexOf( arc_id ), 1 )
		// 	}
		// 	for( const arc_id of ANIMATE.rotating_toons ){
		// 		if( !TOONS[ arc_id ]) ANIMATE.rotating_toons.splice( ANIMATE.rotating_toons.indexOf( arc_id ), 1 )
		// 	}

		// }, 10000 )

		if( env.LOCAL ){

			this.intervals.dev = setInterval(function(){

				SOCKET.send(JSON.stringify({
					type: 'dev_ping'
				}))

			}, 2000 )

		}

	}





	handle_move( packet ){

		// console.log( packet )

		for( const arc_id of Object.keys( packet ) ){

			if( window.USER.arc_id !== arc_id ){

				if( !TOONS[ arc_id ] ){

					console.log('requesting: ', arc_id )

					window.SOCKET.send(JSON.stringify({
						type: 'toon_ping',
						arc_id: arc_id
					}))

				}else{

					console.log('updating patron pos: ', arc_id )

					// if( !TOONS[ arc_id ] ) console.log('wtf: ', TOONS[ arc_id ] )

					TOONS[ arc_id ].ref.position.x = packet[ arc_id ].position.x
					TOONS[ arc_id ].ref.position.y = packet[ arc_id ].position.y
					TOONS[ arc_id ].ref.position.z = packet[ arc_id ].position.z

					TOONS[ arc_id ].ref.quaternion = new Quaternion( 
						packet[ arc_id ].quaternion._x,
						packet[ arc_id ].quaternion._y,
						packet[ arc_id ].quaternion._z,
						packet[ arc_id ].quaternion._w
					)

					TOONS[ arc_id ].needs_lerp = true
					TOONS[ arc_id ].needs_slerp = 400

				}

			}else{

				// console.log('skipping self data in move pulse')

			}

		}

	}

	// handle_move( packet ){

	// 	for( const arc_id of Object.keys( packet ) ){

	// 		if( window.USER.arc_id !== arc_id ){

	// 			if( !TOONS[ arc_id ] ){

	// 				console.log('requesting: ', arc_id )

	// 				window.SOCKET.send(JSON.stringify({
	// 					type: 'toon_ping',
	// 					arc_id: arc_id
	// 				}))

	// 			}else{

	// 				// console.log('updating patron pos: ', arc_id )
	// 				needs_move = needs_rotate = false

	// 				// if( !TOONS[ arc_id ] ) console.log('wtf: ', TOONS[ arc_id ] )
	// 				new_pos = packet[ arc_id ].position
	// 				new_quat = packet[ arc_id ].quaternion
	// 				old_pos = TOONS[ arc_id ].ref.position
	// 				old_quat = TOONS[ arc_id ].ref.quaternion

	// 				if( new_pos.x !== old_pos.x || new_pos.y !== old_pos.y || new_pos.z !== old_pos.z )  needs_move = true
	// 				if( new_quat._x !== old_quat._x || new_quat._y !== old_quat._y || new_quat._z !== old_quat._z || new_quat._w !== old_quat._w )  needs_rotate = true

	// 				if( needs_move ){

	// 					old_pos.set(
	// 						new_pos.x,
	// 						new_pos.y,
	// 						new_pos.z
	// 					)
	// 					// old_pos.x = new_pos.x
	// 					// old_pos.y = new_pos.y
	// 					// old_pos.z = new_pos.z

	// 				}

	// 				if( needs_rotate ){

	// 					// old_quat = new Quaternion( 
	// 					old_quat.set( 
	// 						new_quat._x,
	// 						new_quat._y,
	// 						new_quat._z,
	// 						new_quat._w
	// 					)

	// 				}

	// 				if( needs_move ) ANIMATE.receive_move()
	// 				if( needs_rotate ) ANIMATE.receive_rotate()

	// 				TOONS[ arc_id ].needs_move = needs_move
	// 				TOONS[ arc_id ].needs_rotate = Number( needs_rotate ) * 400

	// 			}

	// 		}else{

	// 			// console.log('skipping self data in move pulse')

	// 		}

	// 	}

	// }

	touch_patron( obj ){
		console.log('unhandled legacy function: ', obj )
	}


	touch_toon( packet ){

		if( packet.user ){
			if( TOONS[ packet.user.arc_id ] ){
				// update
			}else{
				TOONS[ packet.user.arc_id ] = new User( packet.user )
				TOONS[ packet.user.arc_id ].model()
				SCENE.add( TOONS[ packet.user.arc_id ].MODEL )
				TOONS[ packet.user.arc_id ].MODEL.position.set(
					TOONS[ packet.user.arc_id ].ref.position.x,
					TOONS[ packet.user.arc_id ].ref.position.y,
					TOONS[ packet.user.arc_id ].ref.position.z
				)

				// RENDERER.frame( SCENE )

			}
		}

	}

}




function add_machine( data ){

	let machine = data.machine

	machine.children[0].material = data.material

	machine.userData.clickable = true
	machine.userData.name = data.name
	machine.userData.type = 'machine'

	machine.children[0].castShadow = true
	machine.children[0].receiveShadow = true

	bbox.setFromObject( machine )

	machine.position.set( 
		data.center.x - data.offset.x,
		( bbox.max.y - bbox.min.y )/ 2,
		data.center.z - data.offset.z
	)


	SCENE.add( machine )

}





let arcade = false

export default (function(){
	if( arcade ) return arcade
	arcade = new Arcade()
	return arcade
})();

