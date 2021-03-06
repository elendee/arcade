import env from '../env.js'
import GLOBAL from '../GLOBAL.js'

import { 
	Scene, 
	Color, 
	FogExp2, 
} from '../lib/three.module.js'

let scene = false

export default (function(){

	if( scene ) return scene

	scene = new Scene()

	if( GLOBAL.BACKGROUND ){
		scene.background = new Color( GLOBAL.BACKGROUND )
	}
	scene.fog = new FogExp2( GLOBAL.FOG_COLOR, GLOBAL.FOG_SCALAR )

	scene.needs_render = false

	if( !scene.nuke ){
		scene.nuke = function(){
			scene.remove.apply( scene, scene.children )
			scene.dispose()
		}
	}else{
		console.log('scene nuke exists!', scene.nuke )
	}

	return scene

})()
