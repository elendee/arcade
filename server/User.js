// const lib = require('./lib.js')
const log = require('./log.js')
const DB = require('./db.js')

const SOCKETS = require('./SOCKETS.js')

const MAP = require('./MAP.js')

const Persistent = require('./Persistent.js')

const {
	Vector3,
	Quaternion
} = require('three')

const uuid = require('uuid').v4

module.exports = class User extends Persistent {
	
	constructor( init ){

		super( init )

		init = init || {}

		this._needs_pulse = true

		this.email = init.email 

		this.handle = init.handle

		this.height = init.height || 3

		this.speed = init.speed || 20

		this.ref = {
			position: new Vector3( MAP.ZONE_WIDTH / 2, this.height / 2, MAP.ZONE_WIDTH / 2 ),
			quaternion: new Quaternion( 0, 0, 0, 0 )
		}

	}
	


	save( returnNewDocument ){ // same as update() but save all

		const user = this

		const db = DB.getDB()

		if( !OID.isValid( user._id ) )  user._id = OID()

		return new Promise( (resolve, reject ) => {

			db.collection('users').replaceOne({
				_id: user._id
			}, 
			user, 
			{
				upsert: true,
				returnNewDocument: returnNewDocument
			}, function( err, result ){
				if( err || !result ){
					log('flag', 'failed to update user', err )
					reject()
					return false
				}

				if( result.upsertedId ) user._id = result.upsertedId._id // OID 

				if( result.ops[0] ){
					for( const key in result.ops[0]){
						user[ key] = result.ops[0][ key ]
					}
					resolve( result.ops[0])
				}else{
					reject()
				}

				// seems this always need be http session
				// if( SOCKETS[ patron.arc_id ] ){
				// 	SOCKETS[ patron.arc_id ].request.session.save( function( err ){
				// 		if( err ){
				// 			log('err saving register attempt: ', err )
				// 			reject()
				// 		}
				// 		resolve( result.ops[0] )
				// 	})
				// }else{ 
				// 	log('flag', 'tried to save nonexistent socket: ', arc_id )
				// 	reject(0)
				// }

			})

		})	

	}

	

}









