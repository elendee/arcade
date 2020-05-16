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

import * as ANIMATE from './animate.js'

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
	sRGBEncoding
} from '../lib/three.module.js'


import texLoader from '../three/texLoader.js'
import BuffGeoLoader from '../three/texLoader.js'

if( env.EXPOSE ){
	window.SCENE = SCENE
}



let new_pos, new_quat, old_pos, old_quat, needs_move, needs_rotate

// const ground = texLoader.load('/resource/textures/grass.jpg')


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
		// DIALOGUE.init()

		SCENE.add( LIGHT.hemispherical )
		// SCENE.add( LIGHT.spotlight )
		SCENE.add( LIGHT.directional )
		// LIGHT.spotlight.position.set( 
		// 	window.USER.MODEL.position.x, 
		// 	window.USER.MODEL.position.y + 20, 
		// 	window.USER.MODEL.position.z + 20 
		// )
		// LIGHT.spotlight.lookAt( window.USER.MODEL.position )
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

		LIGHT.helper.position.copy( USER.MODEL.position )

		// USER.HEAD.add( CAMERA )
		// USER.MODEL.add( CAMERA )
		SCENE.add( CAMERA )
	    CAMERA.position.copy( window.USER.MODEL.position ).add( CAMERA.offset )
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

		// tiles

		const geometry = new PlaneBufferGeometry( MAP.ZONE_WIDTH, MAP.ZONE_WIDTH, 32 )
		const material = new MeshLambertMaterial({ 
			color: 0x333232, 
			// map: ground,
			// side: DoubleSide 
		})

		const ground = new Mesh( geometry, material )
		ground.receiveShadow = true
		ground.rotation.x = -Math.PI / 2
		ground.position.set( 0, 0, 0 )
		SCENE.add( ground )


		// group of 4 machines
		var arcadegroup = new THREE.Group();
		arcadegroup.position.y = -1;
		scene.add( arcadegroup );

		// texture
		machinetex = texLoader.load('/resource/textures/arcade2c.png')
		machinetex.magFilter = NearestFilter;
		machinetex.minFilter = NearestFilter;
		machinetex.encoding = sRGBEncoding;


		// load model
		BuffGeoLoader.load('/resources/geometries/.arcade.json', function ( geometry ) {
			var material = new MeshBasicMaterial( { 
				map:machinetex
				,transparent:true
			 } );
			var object = new Mesh( geometry, material );
			object.rotation.y = Math.PI;
			// object.receiveShadow = true;
			object.castShadow = true;
			object.scale.set (1.3,1.3,1.3);
			arcadegroup.add( object );
		})


		// const box_geo = new BoxBufferGeometry( 10, 10, 10 )
		// const box_mat = new MeshLambertMaterial({
		// 	color: 'rgb(100, 50, 50)'
		// })
		// const box = new Mesh( box_geo, box_mat )
		// box.castShadow = true
		// SCENE.add( box )
		// box.position.copy( USER.MODEL.position )
		// box.position.x += 20

		RENDERER.frame( SCENE )
		
	}













	begin_intervals(){

		this.intervals.anim_sweeper = setInterval(function(){

			for( const arc_id of ANIMATE.moving_toons ){
				if( !TOONS[ arc_id ]) ANIMATE.moving_toons.splice( ANIMATE.moving_toons.indexOf( arc_id ), 1 )
			}
			for( const arc_id of ANIMATE.rotating_toons ){
				if( !TOONS[ arc_id ]) ANIMATE.rotating_toons.splice( ANIMATE.rotating_toons.indexOf( arc_id ), 1 )
			}

		}, 10000 )

		if( env.LOCAL ){

			this.intervals.dev = setInterval(function(){

				SOCKET.send(JSON.stringify({
					type: 'dev_ping'
				}))

			}, 2000 )

		}

	}






	handle_move( packet ){

		for( const arc_id of Object.keys( packet ) ){

			if( window.USER.arc_id !== arc_id ){

				if( !TOONS[ arc_id ] ){

					console.log('requesting: ', arc_id )

					window.SOCKET.send(JSON.stringify({
						type: 'toon_ping',
						arc_id: arc_id
					}))

				}else{

					// console.log('updating patron pos: ', arc_id )
					needs_move = needs_rotate = false

					// if( !TOONS[ arc_id ] ) console.log('wtf: ', TOONS[ arc_id ] )
					new_pos = packet[ arc_id ].position
					new_quat = packet[ arc_id ].quaternion
					old_pos = TOONS[ arc_id ].ref.position
					old_quat = TOONS[ arc_id ].ref.quaternion

					if( new_pos.x !== old_pos.x || new_pos.y !== old_pos.y || new_pos.z !== old_pos.z )  needs_move = true
					if( new_quat._x !== old_quat._x || new_quat._y !== old_quat._y || new_quat._z !== old_quat._z || new_quat._w !== old_quat._w )  needs_rotate = true

					if( needs_move ){

						old_pos.set(
							new_pos.x,
							new_pos.y,
							new_pos.z
						)
						// old_pos.x = new_pos.x
						// old_pos.y = new_pos.y
						// old_pos.z = new_pos.z

					}

					if( needs_rotate ){

						// old_quat = new Quaternion( 
						old_quat.set( 
							new_quat._x,
							new_quat._y,
							new_quat._z,
							new_quat._w
						)

					}

					if( needs_move ) ANIMATE.receive_move()
					if( needs_rotate ) ANIMATE.receive_rotate()

					TOONS[ arc_id ].needs_move = needs_move
					TOONS[ arc_id ].needs_rotate = Number( needs_rotate ) * 400

				}

			}else{

				// console.log('skipping self data in move pulse')

			}

		}

	}


	touch_toon( packet ){

		if( packet.toon ){
			if( TOONS[ packet.toon.arc_id ] ){
				// update
			}else{
				TOONS[ packet.toon.arc_id ] = new User( packet.toon )
				TOONS[ packet.toon.arc_id ].model()
				SCENE.add( TOONS[ packet.toon.arc_id ].MODEL )
				TOONS[ packet.toon.arc_id ].MODEL.position.set(
					TOONS[ packet.toon.arc_id ].ref.position.x,
					TOONS[ packet.toon.arc_id ].ref.position.y,
					TOONS[ packet.toon.arc_id ].ref.position.z
				)

				RENDERER.frame( SCENE )

			}
		}

	}


}





let arcade = false

export default (function(){
	if( arcade ) return arcade
	arcade = new Arcade()
	return arcade
})();

