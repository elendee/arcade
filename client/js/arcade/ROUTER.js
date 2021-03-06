import env from '../env.js'

import hal from '../hal.js'

import ARCADE from './ARCADE.js'

import DEV from './ui/DEV.js'

// import * as DIALOGUE from './ui/DIALOGUE.js'

import CHAT from './ui/CHAT.js'

import MAP from '../MAP.js'

// import STAT

const bind = function(){

	return new Promise(function( resolve, reject ){

		const SOCKET = window.SOCKET = new WebSocket( env.WS_URL )

		// USER.SOCKET = SOCKET

		SOCKET.onopen = function( event ){

			console.log('connected ws' )

		}


		SOCKET.onmessage = function( msg ){

			let obj = false

			try{
				obj = JSON.parse( msg.data )	
			}catch(e){
				SOCKET.bad_messages++
				if( SOCKET.bad_messages > 100 ) {
					console.log('100+ faulty socket messages', msg )
					SOCKET.bad_messages = 0
				}
				console.log('failed to parse server msg: ', msg )
				return false	
			}



			// console.log('packet rcvd: ', obj )

			switch( obj.type ){

				case 'session_init':
					// console.log('got init: ', obj )
					for( const key of Object.keys( obj.map )){
						MAP[ key ] = obj.map[ key ]
					}
					window.MAP = MAP
					resolve( obj )
					break;

				case 'move_pulse':
					ARCADE.handle_move( obj.packet )
					break;

				// case 'census':
				// 	ARCADE.census( obj.crowd )
				// 	break;

				// case 'profile_pong':
				// 	ARCADE.touch_patron( obj.patron )
				// 	break;

				// case 'floorplan_pong':
				// 	ARCADE.layout( obj.floorplan )
				// 	break;

				case 'toon_pong':
					ARCADE.touch_toon( obj )
					break;

				case 'dev_pong':
					DEV.render('pong', obj )
					break;

				// case 'forest_pong':
				// 	ARCADE.walk_forest( obj.forest )
				// 	break;

				// case 'pillars':
				// 	if( obj.pillars ){
				// 		ARCADE.install( obj.pillars, false )
				// 	}else{
				// 		setTimeout(function(){
				// 			SOCKET.send( JSON.stringify({ 
				// 				type: 'pillar_ping' 
				// 			}))
				// 		}, 1000 )
				// 	}
				// 	break;

				case 'chat':
					CHAT.add_chat( obj )
					break;

				case 'login':
					// console.error('finish switching logout to http .... ')
					// if( obj.success ) {
						// if( obj.patron.arc_id === window.TOON.arc_id ){
						// 	hal('success', 'welcome back!', 3000)
						// }
						ARCADE.touch_patron( obj.patron )
					// }
					break;

				case 'logout':
					console.error('finish switching logout to http .... ')
					// hal('npc', 'adios!')
					// setTimeout(function(){
					// 	location.reload()
					// }, 1000)
					break;

				case 'register':
					// console.error('finish switching register to http .... ')
					// if( obj.success ) {
					if( obj.patron.arc_id === window.TOON.arc_id ){
						hal('success', 'artist created', 4000)
					}
					ARCADE.touch_patron( obj.patron )
					// }
					break;

				case 'profile':
					// console.error('finish switching update to http .... ')
					// if( obj.msg == 'success' ){
					ARCADE.update_toon( obj )
					// }else{
					// 	console.log('error changing profile: ', obj )
					// }
					break;

				case 'new_img':
					ARCADE.new_img( obj )
					break;

				// case 'bot_begin_path':
				// 	ARCADE.handle_bot( obj )
				// 	break;

				// case 'bot_walk':
				// 	ARCADE.handle_bot( obj )
				// 	break;

				// case 'bot_pulse':
				// 	console.log('bot pulse should be deprecated...')
				// 	ARCADE.handle_bot( obj )
				// 	break;

				// case 'bot_thought':
				// 	ARCADE.handle_bot( obj )
				// 	break;

				// case 'zoom':
				// 	window.TOON.zoom()
				// 	break;

				// case 'pulse_pillar_key':
				// 	ARCADE.check_pillar_keys( obj.keys )
				// 	break;

				// case 'pillar_ping_single':
				// 	console.log('single...')
				// 	// ARCADE.install( obj.pillar, true )
				// 	break;

				case 'error':
					hal('error', obj.msg, obj.time, obj.redirect )
					break;

				case 'hal':
					hal( obj.hal_type, obj.msg, obj.time || 10000 )
					break;

				default: break;

			}

		}


		SOCKET.onerror = function( data ){
			console.log('ERROR', data)
			hal('error', 'server error')
		}



		SOCKET.onclose = function( event ){
			hal('error', 'connection closed')
		}



	})


}


export { 
	bind
}