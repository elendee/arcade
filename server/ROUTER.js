const log = require('./log.js')
const env = require('./.env.js')
const lib = require('./lib.js')
const SOCKETS = require('./SOCKETS.js')
// const PILLARS = require('./PILLARS.js')

const EMIT = require('./EMIT.js')

const auth = require('./auth.js')

const { Vector3, Quaternion } = require('three')

// const TREES = require('./TREES.js')
// const BOTS = require('./BOTS.js')

let loc_type, loc_id, LOCATION

module.exports = {

	bind_user: function( GAME, arc_id ){

		let packet = {}





		SOCKETS[ arc_id ].on('message', function( data ){

			try{ 
				packet = lib.sanitize_packet( JSON.parse( data ) )
			}catch(e){
				SOCKETS[ arc_id ].request.session.bad_packets++
				if( SOCKETS[ arc_id ].request.session.bad_packets > 100 ){
					log('flag', 'packet problem for USER:', arc_id, e )
				}
			}

			const USER = SOCKETS[ arc_id ].request.session.USER

			switch( packet.type ){

				case 'user_ping':

					if( SOCKETS[ packet.arc_id ]){
						SOCKETS[ arc_id ].send(JSON.stringify({
							type: 'user_pong',
							user: USER.publish()
						}))
					}

					break;

				case 'toon_ping':
					let user
					for( const arc_id of Object.keys( GAME._USERS ) ){
						if( arc_id === packet.arc_id ){
							user = GAME._USERS[ arc_id ]
						}
					}
					if( user ){
						SOCKETS[ arc_id ].send(JSON.stringify({
							type: 'toon_pong',
							user: user.publish()
						}))
					}
					// if( !zone ) log('flag', 'could not find zone', packet )
					// if( !user ) log('flag', 'could not find user', packet )
					break;

				case 'dev_ping':
					SOCKETS[ arc_id ].send( JSON.stringify({
						type: 'dev_pong',
						// zones: Object.keys( GAME.ZONES )
					}))
					break;

				// case 'pillar_ping':
				// 	log('router', 'pillar ping')

				// 	SOCKETS[ arc_id ].send( JSON.stringify({
				// 		type: 'pillars',
				// 		pillars: PILLARS
				// 	}))

				// 	break;

				// case 'pillar_ping_single':
				// 	if( PILLARS[ packet.arc_id ]){
				// 		SOCKETS[ arc_id ].send( JSON.stringify({
				// 			type: 'pillar_pong_single',
				// 			pillar: PILLARS[ packet.arc_id ]
				// 		}))
				// 	}
				// 	break;

				case 'move_stream':

					if( USER ){

						USER.ref.position = new Vector3(
							packet.ref.position.x,
							packet.ref.position.y,
							packet.ref.position.z
						)
						USER.ref.quaternion = new Quaternion(
							packet.ref.quaternion._x,
							packet.ref.quaternion._y,
							packet.ref.quaternion._z,
							packet.ref.quaternion._w
						)

						USER._needs_pulse = true

					}
					break;

				case 'chat':
					GAME.handle_chat( packet, arc_id )
					break;

				// case 'register':
				// 	auth.register( SOCKETS[ arc_id ].request.session.USER, packet )
				// 	.catch( err => {
				// 		log('flag', 'register err: ', err )
				// 	})
				// 	break;

				// case 'login':
				// 	auth.login( SOCKETS[ arc_id ].request.session.USER, packet )
				// 	.catch( err => {
				// 		log('flag', 'login err: ', err )
				// 	})
				// 	break;

				// case 'logout':
				// 	auth.logout( SOCKETS[ arc_id ].request.session.USER )
				// 	.catch( err => {
				// 		log('flag', 'logout err: ', err )
				// 	})
				// 	break;

				// case 'update_profile':
				// 	log('router', 'update_profile: ', packet )
				// 	auth.update_profile( SOCKETS[ arc_id ].request.session.USER, packet )
				// 	.catch( err => {
				// 		log('flag', 'profile err: ', err )
				// 	})
				// 	break;

				// case 'upload':
				// 	log('flag', 'here she blows: ', packet )
					// break;

				default: break;


			}

		})

		SOCKETS[ arc_id ].on('error', function( data ){

			log('flag', 'socket error: ', data )

		})

		SOCKETS[ arc_id ].on('close', function( data ){

			// for( const this_arc_id of Object.keys( GAME._USERS )){
			// 	if( this_arc_id ===  arc_id ){
			// 		if( GAME.purge ){
			// 			GAME.purge( arc_id )
			// 		}
			// 		delete GAME._USERS[ arc_id ]
			// 	}
			// }
			if( GAME._USERS[ arc_id ] )  delete GAME._USERS[ arc_id ]

			if( SOCKETS[ arc_id ] )  delete SOCKETS[ arc_id ]

			log('connection', 'socket close')

		})

	}

}





















