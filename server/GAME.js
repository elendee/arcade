const log = require('./log.js')
const lib = require('./lib.js')

const GLOBAL = require('./GLOBAL.js')

const User = require('./User.js')
const SOCKETS = require('./SOCKETS.js')
const ROUTER = require('./ROUTER.js')
const MAP = require('./MAP.js')

const DB = require('./db.js')

const Toon = require('./Toon.js')
// const Zone = require('./Zone.js')

// const moment = require('moment')


class Game {

	constructor( init ){

		init = init || {}

		this.opening = false

		this.pulse = false

		this.move_pulse = false

		this._USERS = init._USERS || {}

	}



	async init_async_elements(){

		return true		

	}



	init_sync_elements(){

		const game = this

		game.pulse = setInterval(function(){

			if( !Object.keys( game._USERS ).length ){
				clearInterval( game.pulse )
				game.pulse = false
				log('flag', 'no zones; game going offline')
			}

		}, GLOBAL.PULSES.GAME )

		game.move_pulse = setInterval(function(){
			let packet = {}
			for( const arc_id of Object.keys( game._USERS) ){
				packet[ arc_id ] = {
					position: game._USERS[ arc_id ].ref.position,
					quaternion: game._USERS[ arc_id ].ref.quaternion,
				}
			}
			for( const arc_id of Object.keys( SOCKETS )){
				SOCKETS[ arc_id ].send(JSON.stringify({
					type: 'move_pulse',
					packet: packet 
				}))
			}
		}, 1000)


	}




	async init_user( socket ){

		// const pool = DB.getPool()

		let USER, x, z 

		socket.request.session.USER = USER = new User( socket.request.session.USER )

		SOCKETS[ USER.arc_id ] = socket

		this._USERS[ USER.arc_id ] = USER

		ROUTER.bind_user( this, USER.arc_id )

		SOCKETS[ USER.arc_id ].send( JSON.stringify( {
			type: 'session_init',
			USER: SOCKETS[ USER.arc_id ].request.session.USER.publish(),
			ARCADE: this.game_publish(),
			map: MAP,
		}) )

		return true

	}

		// if( USER._id ){ // auth'd users
				
		// }else{ // non-auth'd users
		// }

		// TOON.arc_id = USER.arc_id // v. important, overwrite arc_id so they share

		// await TOON.fill_inventory()

		// socket.request.session.save(function(){ }) // for the non-auth'd users, so they get same avatar

		// if( TOON.camped_key ){

		// 	const sql = 'SELECT * FROM `structures` WHERE id=? LIMIT 1'

		// 	const values = [ TOON.camped_key ]

		// 	const { error, results, fields } = await pool.queryPromise( sql, values )

		// 	if( error ){
		// 		log('flag', 'err toon init: ', error )
		// 		return false
		// 	}

		// 	if( !results || !results.length || !results[0].zone_key ){
		// 		log('flag', 'initializing uncamped toon')
		// 		x = z = 0
		// 	}else{
		// 		x = lib.tile_from_Xpos( results[0].x )
		// 		z = lib.tile_from_Zpos( results[0].z )
		// 	}

		// }else{ // placing an uncamped toon:

		// 	TOON.ref.position.x = GLOBAL.TOON_START_POS + ( ( 2 * Math.floor( Math.random() * GLOBAL.START_RADIUS ) ) - GLOBAL.START_RADIUS )
		// 	TOON.ref.position.z = GLOBAL.TOON_START_POS + ( ( 2 * Math.floor( Math.random() * GLOBAL.START_RADIUS ) ) - GLOBAL.START_RADIUS )

		// 	// probably will be Zone 0, 0 forever, but just in case:
		// 	x = lib.tile_from_Xpos( TOON.ref.position.x ) + 11
		// 	z = lib.tile_from_Zpos( TOON.ref.position.z )

		// }

		// const layer = TOON._layer

		// const zone = await this.touch_zone( x, z, layer )

		// if( zone ){

		// 	ROUTER.bind_user( this, USER.arc_id )

		// 	zone._TOONS[ USER.arc_id ] = TOON

		// 	const user = SOCKETS[ USER.arc_id ].request.session.USER.publish()
		// 	// user._TOON = 

		// SOCKETS[ USER.arc_id ].send( JSON.stringify( {
		// 	type: 'session_init',
		// 	USER: user,
		// 	TOON: TOON.publish('_INVENTORY'),
		// 	ZONE: zone.publish( '_FLORA', '_NPCS' ),
		// 	map: MAP,
		// }) )

		// }else{

		// 	SOCKETS[ USER.arc_id ].send( JSON.stringify( {
		// 		type: 'error',
		// 		msg: 'error initializing zone<br><a href="/">back to landing page</a>',
		// 	}) )

		// }

	// }







	// async touch_zone( x, z, layer ){

	// 	if( typeof( x ) !== 'number' || typeof( z ) !== 'number' || typeof( layer ) !== 'number' ) return false

	// 	let string_id = lib.zone_id( x, z, layer )

	// 	if( this.ZONES[ string_id ] )  return this.ZONES[ string_id ]
		
	// 	const pool = DB.getPool()

	// 	const sql = 'SELECT * FROM `zones` WHERE x=? AND z=? AND layer=? LIMIT 1'

	// 	const { error, results, fields } = await pool.queryPromise( sql, [x, z, layer])

	// 	let zone 

	// 	if( results && results[0] ){ // read

	// 		zone = new Zone( results[0] )

	// 		log('flag', 'db lg: ', zone._last_growth )

	// 		await zone.bring_online()

	// 	}else{ // create

	// 		zone = new Zone({
	// 			_x: x,
	// 			_z: z,
	// 			_layer: layer
	// 		})

	// 		// log('flag', 'why invalid: ', zone._x, zone._z, zone._layer, x, z, layer )

	// 		await zone.bring_online()

	// 		const res = await zone.save()

	// 	}

	// 	this.ZONES[ zone.get_id() ] = zone

	// 	return zone

	// }




	async get_toon( _id ){

		if( !_id ){
			log('flag', 'invalid get_toon id: ', _id )
			return false
		}

		const pool = DB.getPool()

		const toon_sql = 'SELECT * FROM avatars WHERE id=' + _id + ' LIMIT 1'

		// return new Promise((resolve, reject)=>{

		// })

		const { error, results, fields } = await pool.query( toon_sql )
		if( error ){
			log('flag', 'err get_toon: ', error )
		}

		return results[0]

	}





	handle_chat( packet, arc_id ){

		if( packet.chat.match(/^\/.*/)){
			this.handle_command( packet, arc_id )
			return true
		}

		if( packet.chat == 'xyzzy'){
			// SOCKETS[ arc_id ].send( JSON.stringify({
			// 	type: 'zoom'
			// }))
			return true
		}

		for( const socket_arc_id of Object.keys( SOCKETS )){

			let chat_pack = {
				type: 'chat',
				method: packet.method,
				sender_arc_id: arc_id,
				speaker: SOCKETS[ arc_id ].request.session.USER.name,
				chat: lib.sanitize_chat( packet.chat ),
				color: SOCKETS[ arc_id ].request.session.USER.color
			}
			log('chat', chat_pack.speaker, chat_pack.chat )
			SOCKETS[ socket_arc_id ].send(JSON.stringify( chat_pack ))
		}

	}




	handle_command( packet, arc_id ){

		if( packet.chat.match(/^\/ts$/)){

			this.test_time( arc_id )
			.catch(err=>{
				log('flag', 'err test time: ', err )
			})

		}else if( 1 ){
			// ........
		}

	}




	async test_time( arc_id ){

		////////////////////////////////////////////////////////////////////////
		log('flag', 'test_time disabled')
		return false
		////////////////////////////////////////////////////////////////////////

		const pool = DB.getPool()

		const sql = 'INSERT INTO test (server_stamp) VALUES ("' + moment().format('YYYY-MM-DD hh:mm:ss') + '")'
		// new Date().toISOString().split('.')[0]

		// log('flag', moment().format() )
		// log('flag', moment().format('YYYY-MM-DD hh:mm:ss') )
		// log('flag', new Date().toISOString().split('.')[0] ) //+"Z" )

		const { error, results, fields } = await pool.queryPromise( sql ) 

		if( error ){
			log('flag', 'test err', error )
			return false
		}

		log('commands', 'test results id: ', results.insertId )

		const retrieve = 'SELECT * FROM test WHERE id='+ results.insertId

		pool.query( retrieve, function( error, results, fields ){
			if( error ){
				log('flag', 'errorrrrr: ', error )
				return false
			}
			log('commands', 'and now res: ', results )

			// IITTT WOORRRKKSS

			// CREATED / EDITED / SERVER DATE ALL SAME POST-RETRIEVAL

		})

	}



	game_publish( ...excepted ){

		let users = {}
		for( const arc_id of Object.keys( this._USERS )){
			users[ arc_id ] = this._USERS[ arc_id ].publish()
		}

		return {
			USERS: users
		}

	}





}













let game = false

module.exports = (function(){
	if( game ) return game

	game = new Game()

	return game

})()