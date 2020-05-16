import STATE from './arcade/STATE.js'
import DEV from './arcade/ui/DEV.js'

import { 
	Vector3,
	Quaternion,
	BoxBufferGeometry,
	Mesh,
	MeshLambertMaterial,
	Color
} from './lib/three.module.js'

class User {
	
	constructor( init ){

		init = init || {}

		for( const key of Object.keys( init )){
			this[ key ] = init[ key ]
		}

		console.log( this.ref )

		if( this.ref.position ){
			this.ref.position = new Vector3(
				this.ref.position.x,
				this.ref.position.y,
				this.ref.position.z,
			)
		}else{
			this.ref.position = new Vector3()
		}

		if( this.ref.quaternion ){
			this.ref.quaternion = new Quaternion(
				this.ref.quaternion._x,
				this.ref.quaternion._y,
				this.ref.quaternion._z,
				this.ref.quaternion._w,
			)
		}else{
			this.ref.quaternion = new Quaternion()
		}

		this.needs_move = init.needs_move || false
		this.needs_rotate = init.needs_rotate || false
		
		this.needs_stream = false

		this.intervals = {
			stream: false		
		}

		this.MODEL = init.MODEL


	}


	model( type ){

		// const face_texture = texLoader.load('/resource/textures/profiles/' + ( this.portrait || 'butterbur.png' ) )
		
		const geometry = new BoxBufferGeometry( 1, this.height || 3, 1 )
		const material = new MeshLambertMaterial({
			color: new Color( this.color )
		})
		// const face_material = new MeshLambertMaterial({
		// 	map: face_texture,
		// 	depthWrite: false,
		// 	side: DoubleSide,
		// 	transparent: true
		// })
		this.MODEL = new Mesh( geometry, material )
		this.MODEL.castShadow = true
		this.MODEL.receiveShadow = true

		this.MODEL.userData = {
			clickable: true,
			arc_id: this.arc_id,
			type: type,
			website: this.website,
			name: this.name
		}

		// const head_geometry = new BoxBufferGeometry( 1.2, 1.2, 1.2 )
		// const head_material = material
		// this.HEAD = new Mesh( head_geometry, material )
		// this.HEAD.castShadow = true
		// this.HEAD.receiveShadow = true
		// this.HEAD.position.set( 0, this.height / 2, 0 ) 

		// const face_geometry = new PlaneBufferGeometry( 2, 2, 2 )
		// // const face_material = material
		// this.FACE = new Mesh( face_geometry, face_material )
		// this.FACE.castShadow = true
		// this.FACE.receiveShadow = true
		// this.FACE.position.set( 0, .5, .7 )

		// this.HEAD.add( this.FACE )
		// this.MODEL.add( this.HEAD )

	}

	begin_intervals(){

		const toon = this

		this.intervals.stream = setInterval(function(){

			// if( STATE.stream_down ){
			if( toon.needs_stream ){

				if( window.SOCKET && window.SOCKET.send ){

					window.SOCKET.send(JSON.stringify({
						type: 'move_stream',
						ref: {
							position: toon.MODEL.position,
							quaternion: toon.MODEL.quaternion
						}
					}))

				}

				toon.needs_stream = false

				DEV.render('coords', {
					x: toon.MODEL.position.x,
					z: toon.MODEL.position.z
				})

			}

		}, 2000 )

	}

}

export default User