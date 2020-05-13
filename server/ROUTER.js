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

			const TOON = SOCKETS[ arc_id ].request.session.USER.TOON

			switch( packet.type ){

				case 'user_ping':

					if( SOCKETS[ packet.arc_id ]){
						SOCKETS[ arc_id ].send(JSON.stringify({
							type: 'user_pong',
							user: TOON.publish()
						}))
					}

					break;

				case 'toon_ping':
					let zone, toon
					for( const zone_id of Object.keys( GAME.ZONES )){
						for( const toon_id of Object.keys( GAME.ZONES[ zone_id ]._TOONS )){
							log('flag', 'resident toons.. ', toon_id )
							if( toon_id === packet.arc_id ){
								zone = GAME.ZONES[ zone_id ]
							}
						}
					}
					if( zone ){
						for( const toon_id of Object.keys( zone._TOONS ) ){
							if( toon_id === packet.arc_id ){
								toon = zone._TOONS[ toon_id ]
							}
						}
						if( toon ){
							SOCKETS[ arc_id ].send(JSON.stringify({
								type: 'toon_pong',
								toon: toon.publish()
							}))
						}
					}
					// if( !zone ) log('flag', 'could not find zone', packet )
					// if( !toon ) log('flag', 'could not find toon', packet )
					break;

				case 'dev_ping':
					SOCKETS[ arc_id ].send( JSON.stringify({
						type: 'dev_pong',
						zones: Object.keys( GAME.ZONES )
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

					if( TOON ){

						TOON.ref.position = new Vector3(
							packet.ref.position.x,
							packet.ref.position.y,
							packet.ref.position.z
						)
						TOON.ref.quaternion = new Quaternion(
							packet.ref.quaternion._x,
							packet.ref.quaternion._y,
							packet.ref.quaternion._z,
							packet.ref.quaternion._w
						)

						TOON.needs_pulse = true

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

			for( const z_id of Object.keys( GAME.ZONES )){
				for( const t_id of Object.keys( GAME.ZONES[ z_id ]._TOONS )){
					if( t_id ===  arc_id ){
						GAME.ZONES[ z_id ].purge( arc_id )
					}
				}
			}

			if( SOCKETS[ arc_id ] )  delete SOCKETS[ arc_id ]

			log('connection', 'socket close')

		})

	}

}




















