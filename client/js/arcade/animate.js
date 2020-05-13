import env from '../env.js'
import * as lib from '../lib.js'

import DEV from './ui/DEV.js'

import { Vector3 } from '../lib/three.module.js'

import RENDERER from '../three/RENDERER.js'
import SCENE from '../three/SCENE.js'
import CAMERA from '../three/CAMERA.js'
//import SKYBOX from '../three/SKYBOX.js'
// import GROUND from '../three/GROUND.js'
// import PILLARS from './PILLARS.js'
import TOONS from './TOONS.js'
import * as LIGHT from '../three/LIGHT.js'
// import CONTROLS from './three/CONTROLS.js'
import STATE from './STATE.js'
import MAP from '../MAP.js'



if( env.EXPOSE ) window.RENDERER = RENDERER

let delta, now, then, delta_seconds
const direction = []
const distance = []
const facing = new Vector3()
const FORWARD = new Vector3(0, 0, 1)

const moving_toons = []
const rotating_toons = []



// function update_compass(){
// 	STATE.compassing = true
// 	document.getElementById('compass-arrow').style.transform = 'rotate(' + Math.floor( lib.radians_to_degrees( USER.MODEL.rotation.y ) ) + 'deg)'
// 	setTimeout(function(){
// 		document.getElementById('compass-arrow').style.transform = 'rotate(' + Math.floor( lib.radians_to_degrees( USER.MODEL.rotation.y ) ) + 'deg)'
// 		STATE.compassing = false
// 	}, 1000 )
// }


function move( dir, pressed ){
	switch( dir ){
		case 'forward':
			STATE.move.forward = pressed
			if( pressed ){
				STATE.stream_down = true
				window.USER.needs_stream = true
				if( !STATE.animating ) animate( true )
			}else{
				check_stream()
			}
			break;

		case 'back':
			STATE.move.back = pressed
			if( pressed ){
				STATE.stream_down = true
				window.USER.needs_stream = true
				if( !STATE.animating ) animate( true )
			}else{
				check_stream()
			}
			break;

		case 'left':
			STATE.move.left = pressed
			if( pressed ){
				STATE.stream_down = true
				window.USER.needs_stream = true
				if( !STATE.animating ) animate( true )
			}else{
				check_stream()
			}
			break;

		case 'right':
			STATE.move.right = pressed
			if( pressed ){
				STATE.stream_down = true
				window.USER.needs_stream = true
				if( !STATE.animating ) animate( true )
			}else{
				check_stream()
			}
			break;

		case 'cancel':
			STATE.rotate.right = STATE.rotate.left = STATE.move.forward = STATE.move.back = false
			STATE.stream_down = false
			break;

		default: break;
	}
}


function analog_turn( amount ){

	if( amount ){
		window.USER.MODEL.rotation.y -= amount
		window.USER.needs_stream = true
		STATE.stream_down = true
		if( !STATE.animating ) animate( true )
	}else{
		check_stream()
	}

	// if( !STATE.compassing ) update_compass()

}

function digital_turn( dir, pressed ){

	switch( dir ){
		case 'left':
			STATE.rotate.left = pressed
			break;

		case 'right':
			STATE.rotate.right = pressed
			break;

		default: break;
	}

	if( pressed ){
		STATE.stream_down = true
		window.USER.needs_stream = true
		if( !STATE.animating ) animate( true )
	}else{
		check_stream()
	}

	if( !STATE.compassing ) update_compass()

}



function receive_move( arc_id ){
	if( !moving_toons.includes( arc_id ) ){
		moving_toons.push( arc_id )
		if( !STATE.animating )  animate( true )
	}
}


function receive_rotate( arc_id ){
	if( !moving_toons.includes( arc_id ) ){
		moving_toons.push( arc_id )
		if( !STATE.animating )  animate( true )
	}	
}




function check_stream(){
	if( !STATE.move.forward && !STATE.move.back && !STATE.move.left && !STATE.move.right ){
		STATE.stream_down = false
	}
}



function animate( start ){

	if( typeof( start ) === 'boolean' ){
		then = performance.now()
		// console.log('anim start', start )
	}

	STATE.animating = true

	if( !STATE.stream_down && !moving_toons.length && !rotating_toons.length ){ // && !x && !y ....
		// console.log('anim end')
		STATE.animating = false
		return false
	}

	requestAnimationFrame( animate )

	now = performance.now()

	delta = now - then

	then = now 

	delta_seconds = delta / 1000

	DEV.render('modulo')

	if( STATE.stream_down ){

		direction[0] = Number( STATE.move.left ) - Number( STATE.move.right )
	    direction[1] = Number( STATE.move.forward ) - Number( STATE.move.back )

	    distance[0] = direction[0] * delta_seconds * window.USER.speed
	    distance[1] = direction[1] * delta_seconds * window.USER.speed

	    if(direction[0] != 0 && direction[1] != 0){
			distance[0] *= .7
			distance[1] *= .7
	    }

	    window.USER.MODEL.translateX( distance[0] )
	    window.USER.MODEL.translateZ( distance[1] )

	    // bounds:
	    window.USER.MODEL.position.x = Math.min( Math.max( 0, window.USER.MODEL.position.x ), MAP.ZONE_WIDTH )
	    window.USER.MODEL.position.z = Math.min( Math.max( 0, window.USER.MODEL.position.z ), MAP.ZONE_WIDTH )

	    CAMERA.position.copy( window.USER.MODEL.position ).add( CAMERA.offset )

		// SKYBOX.position.copy( window.USER.MODEL.position )

		// LIGHT.spotlight.position.copy( window.USER.MODEL.position ).add( LIGHT.offset )

		RENDERER.shadowMap.needsUpdate = true

		// GROUND.position.x = window.USER.MODEL.position.x
		// GROUND.position.z = window.USER.MODEL.position.z

	}

	if( STATE.rotate.left ){
		window.USER.MODEL.rotation.y += MAP.ROTATE_RATE
	}else if( STATE.rotate.right ){
		window.USER.MODEL.rotation.y -= MAP.ROTATE_RATE
	}

	for( const arc_id of Object.keys( TOONS )){ // should not include player
		if( TOONS[ arc_id ].needs_move ){
			TOONS[ arc_id ].MODEL.position.lerp( TOONS[ arc_id ].ref.position, .01 )
			if( TOONS[ arc_id ].MODEL.position.distanceTo( TOONS[ arc_id ].ref.position ) < .1 ){
				TOONS[ arc_id ].needs_move = false
				moving_toons.splice( moving_toons.indexOf( arc_id ), 1 )
				// delete moving_toons[ arc_id ]
				// console.log('lerp arrived')
			}
		}
		if( TOONS[ arc_id ].needs_rotate > 0 ){
			TOONS[ arc_id ].MODEL.quaternion.slerp( TOONS[ arc_id ].ref.quaternion, .01 )
			TOONS[ arc_id ].needs_rotate--
			if( TOONS[ arc_id ].needs_rotate === 0 ){
				// console.log( 'slerp arrived')
				// TOONS[ arc_id ].
				rotating_toons.splice( rotating_toons.indexOf( arc_id ), 1 )
			}
		}
	}

	// for( const arc_id of Object.keys( BOTS )){ // should not include player
	// 	if( BOTS[ arc_id ].needs_move ){
	// 		BOTS[ arc_id ].MODEL.position.lerp( BOTS[ arc_id ].ref.position, .01 )
	// 		if( BOTS[ arc_id ].MODEL.position.distanceTo( BOTS[ arc_id ].ref.position ) < .1 ){
	// 			BOTS[ arc_id ].needs_move = false
	// 			// console.log('lerp arrived')
	// 		}
	// 	}
	// 	if( BOTS[ arc_id ].needs_rotate > 0 ){
	// 		BOTS[ arc_id ].MODEL.quaternion.slerp( BOTS[ arc_id ].ref.quaternion, .02 )
	// 		BOTS[ arc_id ].needs_rotate--
	// 		// if( BOTS[ arc_id ].needs_rotate === 0 ) console.log( 'slerp arrived')
	// 	}
	// }
	
	// for( const arc_id of Object.keys( PILLARS )){
	// 	if( PILLARS[ arc_id ].MODEL.position.y > 300 ){
	// 		PILLARS[ arc_id ].destruct()
	// 	}else if( PILLARS[ arc_id ].ballooning ){
	// 		PILLARS[ arc_id ].MODEL.position.y += .2
	// 		PILLARS[ arc_id ].MODEL.rotation.y += PILLARS[ arc_id ].balloonY
	// 		PILLARS[ arc_id ].MODEL.rotation.z += PILLARS[ arc_id ].balloonZ
	// 	}
	// }

	RENDERER.render( SCENE, CAMERA )
	// console.log('ya')

}




export { 
	move,
	analog_turn,
	digital_turn,
	moving_toons,
	rotating_toons,
	receive_move,
	receive_rotate
}
