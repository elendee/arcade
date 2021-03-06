import env from '../../env.js'
import * as lib from '../../lib.js'

import STATE from '../STATE.js'

import RENDERER from '../../three/RENDERER.js'
import CAMERA from '../../three/CAMERA.js'

import GLOBAL from '../../GLOBAL.js'

import TOONS from '../TOONS.js'
// import NPCS from '../NPCS.js'

import {
	Vector3
} from '../../lib/three.module.js'


class Chat {

	constructor( init ){

		init = init || {}
		this.ele = document.getElementById('chat')
		this.input = document.getElementById('chat-input')
		this.content = document.getElementById('chat-content')

		this.chat_check = false
		this.pulse = false

		this.BUBBLES = {}

	}

	init(){

		const chat = this

		chat.input.addEventListener('blur', function(){
			STATE.handler = 'arcade'
			// if( document.body.classList.contains('gallery') ){
			// 	STATE.handler = 'gallery'
			// }else if( document.body.classList.contains('station') ){
			// 	STATE.handler = 'station'
			// }else{
			// 	STATE.handler = 'none'
			// }
		})

		chat.input.addEventListener('focus', function(){
			console.log('focus chat')
			STATE.handler = 'chat'
		})

		chat.ele.addEventListener('click', function(){ 
			if( STATE.handler !== 'chat' ) chat.input.focus()  
		})
	}


	add_chat( obj ){
		// type
		// method
		// sender_arc_id
		// speaker
		// chat
		// color

		const CHAT = this		

		if( !obj.sender_arc_id ){
			console.log('undefined sender_arc_id ', obj )
			return false
		}

		// if( !NPCS[ obj.sender_arc_id ] && !TOONS[ obj.sender_arc_id ] && window.USER.arc_id !== obj.sender_arc_id ){
		// 	console.log('no toon found for chat ', obj.sender_arc_id )
		// 	return false
		// }

		const chat = document.createElement('div')
		chat.classList.add('chat')
		chat.classList.add( obj.method )
		if( obj.sender_arc_id == window.USER.arc_id ) chat.classList.add('self')
		chat.innerHTML = `<span class="speaker" style="color: ${ obj.color }">${ obj.speaker }: </span>${ obj.chat }`

		this.content.appendChild( chat )

		this.content.scroll( 0, 9999 )

		const chats = document.getElementsByClassName('chat')
		const diff = chats.length - 50
		for( let i = 0; i < diff; i++ ){
			chats[ 0 ].remove()
		}

		// if( !TOONS[ obj.sender_arc_id ] && window.USER.arc_id !== obj.sender_arc_id ){
		// 	console.log('speaker not found for chat')
		// 	return false
		// }

		const bubble = new Bubble( obj )

		setTimeout(function(){
			bubble.update_position()
		}, 50)

		this.BUBBLES[ bubble.hash ] = bubble

		setTimeout(function(){
			bubble.ele.remove()
			delete CHAT.BUBBLES[ bubble.hash ]
		}, 6000 )

	}


	send_chat(){

		const val = this.input.value.trim()

		if( val.length > 240 ) {
			hal('hal', '240 character max', 3000 )
			return false
		}

		if( val && val != '' ){

			let pack = JSON.stringify({
				type: 'chat',
				method: 'say',
				chat: val
			})

			window.SOCKET.send( pack )

			this.input.value = ''
		}

	}


	begin_pulse(){

		const CHAT = this

		CHAT.chat_check = setInterval(function(){

			if( Object.keys( CHAT.BUBBLES ).length ){

				CHAT.pulse = setInterval(function(){

					for( const hash of Object.keys( CHAT.BUBBLES ) ){
						CHAT.BUBBLES[ hash ].update_position()
					}

				}, 150 )

				// console.log( CHAT.pulse )

			}else{

				// console.log( CHAT.pulse )

				if( CHAT.pulse ){
					clearInterval( CHAT.pulse )
					CHAT.pulse = false
				}
			}

		}, 2000)

	}

}






class Bubble {

	constructor( init ){

		init = init || {}

		this.type = init.type
		this.hash = lib.random_hex( 6 )
		this.method = init.method
		this.sender_arc_id = init.sender_arc_id
		this.speaker = init.speaker
		this.chat = init.chat
		this.color = init.color

		this.ele = document.createElement('div')
		this.ele.classList.add('chat-bubble')
		this.ele.style.color = this.color
		// <span>${ this.speaker }:</span>
		this.ele.innerHTML = `${ this.chat }`
		document.body.appendChild( this.ele )

		this.bound = false

		this.posX = 0
		this.posY = 0
		// this.overhang_b = 0
		// this.overhang_l = 0

	}

	update_position(){

		let vector
		if( this.sender_arc_id == window.USER.arc_id ){
			vector = new Vector3().copy( window.USER.MODEL.position )
		}else if( TOONS[ this.sender_arc_id ] && TOONS[ this.sender_arc_id ].MODEL ){
			vector = new Vector3().copy( TOONS[ this.sender_arc_id ].MODEL.position )
		// }else if( NPCS[ this.sender_arc_id ] && NPCS[ this.sender_arc_id ].MODEL ){
		// 	vector = new Vector3().copy( NPCS[ this.sender_arc_id ].MODEL.position )
		}else{
			console.log('no model found for chat ', this.sender_arc_id )
			return false
		}

		const canvas = RENDERER.domElement

		const scalarX = canvas.width / window.innerWidth
		const scalarY = canvas.height / window.innerHeight
		// GLOBAL.RES_MAP[ GLOBAL.RES_KEY ]

		vector.project( CAMERA )
		vector.x = Math.round( ( vector.x + 1 ) * canvas.width  / 2 )
		// vector.x = Math.round( ( vector.x + 1 ) * scalar )
		vector.y = Math.round( ( -vector.y + 1 ) * canvas.height / 2 )
		// vector.y = Math.round( ( -vector.y + 1 ) * scalar )
		// vector.y = 0
		vector.z = 0;
		// vector.z = Math.round( ( - vector.z + 1 ) * canvas.height / 2 )

		this.posX = Math.floor( vector.x / scalarX ) + 5
		this.posY = Math.floor( vector.y / scalarY ) - 5
		// this.posY = vector.z //- 30

		this.bound = this.ele.getBoundingClientRect()


		if( this.posX + this.bound.width > window.innerWidth ){
			this.ele.style.left = 'auto'
			this.ele.style.right = '0px'
		}else{
			this.ele.style.left = this.posX + 'px'
			this.ele.style.right = 'auto'
		}

		if( this.posY > window.innerHeight ){
			this.ele.style.top = 'auto'
			this.ele.style.bottom = '0px'
		}else{
			this.ele.style.bottom = ( window.innerHeight - this.posY ) + 'px'
			this.ele.style.top = 'auto'
		}
		
	}



}








let chat = false

export default (function(){

	if( chat ) return chat

	chat = new Chat()

	return chat

})()
