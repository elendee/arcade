import { Vector3 } from '../lib/three.module.js'

import RENDERER from '../three/RENDERER.js'
import SCENE from '../three/SCENE.js'
import CAMERA from '../three/CAMERA.js'
// import SKYBOX from './three/SKYBOX.js'
// import GROUND from './three/GROUND.js'
// import PILLARS from './PILLARS.js'
import TOONS from './TOONS.js'
import * as LIGHT from '../three/LIGHT.js'
// import CONTROLS from './three/CONTROLS.js'
import STATE from './STATE.js'
import MAP from '../MAP.js'


// import PATRONS from './PATRONS.js'


window.RENDERER = RENDERER

let delta, now, then, delta_seconds
const direction = []
const distance = []
const facing = new Vector3()
const FORWARD = new Vector3(0, 0, 1)




export default function animate(){

	if( !STATE.animating ) return false

	requestAnimationFrame( animate )

	now = performance.now()

	delta = now - then

	then = now 

	delta_seconds = delta / 1000

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

		// SKYBOX.position.copy( window.USER.MODEL.position )

		LIGHT.spotlight.position.copy( window.USER.MODEL.position ).add( LIGHT.offset )

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
		if( TOONS[ arc_id ].needs_lerp ){
			TOONS[ arc_id ].MODEL.position.lerp( TOONS[ arc_id ].ref.position, .02 )
			if( TOONS[ arc_id ].MODEL.position.distanceTo( TOONS[ arc_id ].ref.position ) < .1 ){
				TOONS[ arc_id ].needs_lerp = false
				// console.log('lerp arrived')
			}
		}
		if( TOONS[ arc_id ].needs_slerp > 0 ){
			TOONS[ arc_id ].MODEL.quaternion.slerp( TOONS[ arc_id ].ref.quaternion, .02 )
			TOONS[ arc_id ].needs_slerp--
			// if( TOONS[ arc_id ].needs_slerp === 0 ) console.log( 'slerp arrived')
		}
	}


	// for( const dpkt_id of Object.keys( BOTS )){ // should not include player
	// 	if( BOTS[ dpkt_id ].needs_lerp ){
	// 		BOTS[ dpkt_id ].MODEL.position.lerp( BOTS[ dpkt_id ].ref.position, .01 )
	// 		if( BOTS[ dpkt_id ].MODEL.position.distanceTo( BOTS[ dpkt_id ].ref.position ) < .1 ){
	// 			BOTS[ dpkt_id ].needs_lerp = false
	// 			// console.log('lerp arrived')
	// 		}
	// 	}
	// 	if( BOTS[ dpkt_id ].needs_slerp > 0 ){
	// 		BOTS[ dpkt_id ].MODEL.quaternion.slerp( BOTS[ dpkt_id ].ref.quaternion, .02 )
	// 		BOTS[ dpkt_id ].needs_slerp--
	// 		// if( BOTS[ dpkt_id ].needs_slerp === 0 ) console.log( 'slerp arrived')
	// 	}
	// }
	

	// for( const dpkt_id of Object.keys( PILLARS )){
	// 	if( PILLARS[ dpkt_id ].MODEL.position.y > 300 ){
	// 		PILLARS[ dpkt_id ].destruct()
	// 	}else if( PILLARS[ dpkt_id ].ballooning ){
	// 		PILLARS[ dpkt_id ].MODEL.position.y += .2
	// 		PILLARS[ dpkt_id ].MODEL.rotation.y += PILLARS[ dpkt_id ].balloonY
	// 		PILLARS[ dpkt_id ].MODEL.rotation.z += PILLARS[ dpkt_id ].balloonZ
	// 	}
	// }


	RENDERER.render( SCENE, CAMERA )

}