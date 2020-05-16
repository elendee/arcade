
import env from '../../env.js'

import STATE from '../STATE.js'
// import SOUND from '../../SOUND.js'

import CHAT from './CHAT.js'

// import * as DIALOGUE from './DIALOGUE.js'
// import * as POPUP from './POPUP.js'

// import * as HUD from './HUD.js'
// import { getBar } from './ACTION_BAR.js'

import BINDS from './BINDS.js'

import TARGET from './TARGET.js'

// import * as ANIMATE from '../animate.js'

// const BAR = getBar()







let global_handled = false


function handle_keydown( e ){

	global_handled = false

	switch( e.keyCode ){

		case 17:
			STATE.ctrlKey = true
			break;

		case 16:
			STATE.shiftKey = true
			break;

		default: break;
	}

	if( !global_handled ){

		if( STATE.handler == 'chat' ){

			switch( e.keyCode ){

				case BINDS.chat.send:
					CHAT.send_chat()
					global_handled = true
					break;

				default: break;
			}

		}else if( STATE.handler == 'arcade' ){

			window.USER.needs_stream = true

			switch( e.keyCode ){

			case BINDS.global.chat:
				CHAT.input.focus()
				break;

			case BINDS.arcade.move.left:
				STATE.stream_down = true
				STATE.move.left = true
				// ANIMATE.move('left', true )
				break

			case BINDS.arcade.move.right:
				STATE.stream_down = true
				STATE.move.right = true
				// ANIMATE.move('right', true )
				break

			case BINDS.arcade.move.forward: 
				STATE.stream_down = true
				STATE.move.forward = true
				// ANIMATE.move('forward', true )
				break

			case BINDS.arcade.move.back:
				STATE.stream_down = true
				STATE.move.back = true
				// ANIMATE.move('back', true )
				break

			case BINDS.arcade.move_alt.forward:
				STATE.stream_down = true
				STATE.move.forward = true
				// ANIMATE.move('forward', true )
				break;

			case BINDS.arcade.move_alt.back:
				STATE.stream_down = true
				STATE.move.back = true
				// ANIMATE.move('back', true )
				break;

			case BINDS.arcade.turn.left:
				STATE.stream_down = true
				STATE.move.left = true
				// ANIMATE.move('left', true)
				// ANIMATE.digital_turn('left', true )
				break;

			case BINDS.arcade.turn.right:
				STATE.stream_down = true
				STATE.move.right = true
				// ANIMATE.move('right', true)
				// ANIMATE.digital_turn('right', true )
				break;

			case BINDS.arcade.actions.one:
				break;

			case BINDS.arcade.actions.two:
				break;

			case BINDS.arcade.actions.three:
				break;

			case BINDS.arcade.actions.four:
				break;

			default: 
				break

			}//switch

		}

	}

}//func









function handle_keyup( e ){

	// console.log('keys', 'keyup: ', STATE.handler, e.keyCode )
	
	global_handled = false

	switch( e.keyCode ){

		case BINDS.global.close:
			if( STATE.handler === 'chat' ){
				CHAT.input.blur()
			}else if( STATE.handler === 'dialogue' ){
				console.log('unhandled close dialgoue....')
			}else if( TARGET.status_ele.style.display !== 'none' ){
				TARGET.clear( true )
			}
			global_handled = true
			break;

		case 17:
			STATE.ctrlKey = false
			break;

		case 16:
			STATE.shiftKey = false
			break;

		default: break;
	}

	if( !global_handled ){

		if( STATE.handler == 'chat' ){

		}else if( STATE.handler == 'arcade' ){

			switch(e.keyCode){

			case BINDS.arcade.move.forward:
				// STATE.stream_down = true
				STATE.move.forward = false				
				check_stream()
				// ANIMATE.move('forward', false)
				break

			case BINDS.arcade.move.back:
				// STATE.stream_down = false
				STATE.move.back = false				
				check_stream()
				// ANIMATE.move('back', false)
				break

			case BINDS.arcade.move.left:
				// STATE.stream_down = false
				STATE.move.left = false				
				check_stream()
				// ANIMATE.move('left', false)
				break

			case BINDS.arcade.move.right:
				// STATE.stream_down = false
				STATE.move.right = false				
				check_stream()
				// ANIMATE.move('right', false)
				break

			case BINDS.arcade.move_alt.forward:
				// STATE.stream_down = false
				STATE.move.forward = false				
				check_stream()
				// ANIMATE.move('forward', false)
				break;

			case BINDS.arcade.move_alt.back:
				// STATE.stream_down = false
				STATE.move.back = false				
				check_stream()
				// ANIMATE.move('back', false)
				break;

			case BINDS.arcade.turn.left:
				// STATE.stream_down = false
				// ANIMATE.digital_turn('left', false)
				check_stream()
				STATE.move.false = false					
				// ANIMATE.move('left', false)
				break;

			case BINDS.arcade.turn.right:
				// STATE.stream_down = false
				STATE.move.right = false		
				check_stream()		
				// ANIMATE.move('right', false) // these should be 'move_alt', too lazy...
				// ANIMATE.digital_turn('right', false)
				break;

			// case BINDS.arcade.flip_cam:
			// 	flip_cam('return')
			// 	break;

			case BINDS.arcade.actions.one:
				console.log('action one')
				break;

			case BINDS.arcade.actions.two:
				console.log('action two')
				break;

			case BINDS.arcade.actions.three:
				console.log('action three')
				break;

			case BINDS.arcade.actions.four:
				console.log('action four')
				break;

			default: 
				break
			}

		}

	}

}






// let step_close

function init( zone ){

	// step_close = close_func

	document.addEventListener('keyup', handle_keyup )
	document.addEventListener('keydown', handle_keydown )

	// if( window.innerWidth < 800 ){


		// if( env.LOCAL ){
		// 	console.log('skipping mobile controls')
		// }else{
		// 	alert('mobile controls coming soon')
		// }


		// const mcf = document.getElementById('mc-forward');
		// mcf.addEventListener("touchstart", handleForward, false);
		// mcf.addEventListener("touchend", handleEnd, false);
		// mcf.addEventListener("touchcancel", handleCancel, false);

		// const mcb = document.getElementById('mc-back');
		// mcb.addEventListener("touchstart", handleBack, false);
		// mcb.addEventListener("touchend", handleEnd, false);
		// mcb.addEventListener("touchcancel", handleCancel, false);

		// const mcl = document.getElementById('mc-left');
		// mcl.addEventListener("touchstart", handleLeft, false);
		// mcl.addEventListener("touchend", handleEnd, false);
		// mcl.addEventListener("touchcancel", handleCancel, false);

		// const mcr = document.getElementById('mc-right');
		// mcr.addEventListener("touchstart", handleRight, false);
		// mcr.addEventListener("touchend", handleEnd, false);
		// mcr.addEventListener("touchcancel", handleCancel, false);
		// mcf.addEventListener("touchmove", handleMove, false);
	// }

}



// function handleForward( e ){
// 	e.preventDefault()
// 	ANIMATE.move('forward')
// }

// function handleBack( e ){
// 	e.preventDefault()
// 	ANIMATE.move('back')
// }

// function handleLeft( e ){
// 	e.preventDefault()
// 	ANIMATE.move('left')
// }

// function handleRight( e ){
// 	e.preventDefault()
// 	ANIMATE.move('right')
// }

// function handleEnd( e ){
// 	e.preventDefault()
// 	STATE.rotate.right = STATE.rotate.left = STATE.move.forward = STATE.move.back = false
// 	STATE.stream_down = false
// }

// function handleCancel( e ){
// 	e.preventDefault()
// 	ANIMATE.move('cancel')
// }


function apply_user_bindings(){
	
	Object.keys( BINDS ).forEach( function( key ){
		if( window.USER.bindings[key] && typeof( window.USER.bindings[key] ) == 'number' ){
			BINDS[key] = window.USER.bindings[key]
		}
	})

}


function check_stream(){
	if( !STATE.move.forward && !STATE.move.back && !STATE.move.left && !STATE.move.right ){
		STATE.stream_down = false
	}
}




// function flip_cam( type ){
// 	if( type == 'flip' ){
// 		if( !STATE.cam_flip ){
// 			CAMERA.position.z = Math.abs( CAMERA.position.z ) 
// 			CAMERA.lookAt( window.USER.MODEL.position )
// 			STATE.cam_flip = true
// 		}
// 	}else if( type == 'return' ){
// 		CAMERA.position.z = Math.abs( CAMERA.position.z ) * -1
// 		CAMERA.lookAt( window.USER.MODEL.position )
// 		STATE.cam_flip = false
// 	}
// }




export { 
	init,
}
