
import env from './env.js'
import hal from './hal.js'

import * as ACTION_BAR from './arcade/ui/ACTION_BAR.js'
import * as KEYS from './arcade/ui/KEYS.js'

import * as ROUTER from './arcade/ROUTER.js'

import DEV from './arcade/ui/DEV.js'

import ARCADE from './arcade/ARCADE.js'

import RENDERER from './three/RENDERER.js'

import STATE from './arcade/STATE.js'

import User from './User.js'

// import Toon from './arcade/Toon.js'

document.addEventListener('DOMContentLoaded', function(){

	ACTION_BAR.init()

	KEYS.init()

	window.addEventListener( 'resize', RENDERER.onWindowResize, false )

	ROUTER.bind()
	.then( res => {
		init_session( res )
		ARCADE.initialize()
		ARCADE.render( res.ARCADE )
	})
	.catch( err => {
		console.log( err )
	})


})





async function init_session( res ){

	// console.log( res.USER.TOON._INVENTORY )

	if( env.LOCAL )  DEV.ele.style.display = 'initial'

	// websocket now bound


	// window.SCENE = SCENE
	window.USER = new User( res.USER )
	// if( env.EXPOSE )  window.ZONE = ZONE
	// window.TOON.model()

	// SCENE.add( GROUND )

	// SCENE.add( SKYBOX )


	// const box = new BoxBufferGeometry(3, 3, 3)
	// const wires = new WireframeGeometry( box )

	// USER.box = new LineSegments( wires )
	// USER.box.material.depthTest = false
	// // USER.box.material.opacity = env.BOX_OPACITY
	// USER.box.material.transparent = true

	// USER.box.position.copy( USER.PILOT.SHIP.ref.position )
	// USER.box.quaternion.copy( USER.PILOT.SHIP.ref.quaternion )

	return true

}
