
import env from '../env.js'
import GLOBAL from '../GLOBAL.js'

import { 
	MeshBasicMaterial, 
	BackSide, 
	CubeGeometry, 
	TextureLoader,
	Mesh
} from '../lib/three.module.js'



// import SCENE from './SCENE.js'

let skyBox = false

export default (function(){

	if(skyBox) return skyBox

	// const box_img = '/resource/textures/skybox/bluecloud_'

	// const directions  = ['ft', 'bk', 'up', 'dn', 'rt', 'lt']

	let skyGeometry = new CubeGeometry( GLOBAL.SKY_WIDTH / 10, GLOBAL.SKY_WIDTH / 10, GLOBAL.SKY_WIDTH / 10 )	
	let materialArray = new Array(6)

	const loader = new TextureLoader()
	loader.load( '/resource/textures/starfield.jpg', function(tex){
		const tex_mat = new MeshBasicMaterial({
			map: tex,
			side: BackSide,
			fog: false
		})		
		for(let i=0;i < 6; i++ ){
			materialArray[i] = tex_mat
		}
	})
		
	skyBox = new Mesh( skyGeometry, materialArray )

	skyBox.userData.howdy = 'howdy'

	return skyBox

})()