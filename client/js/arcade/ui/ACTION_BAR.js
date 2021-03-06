
import Popup from './Popup.js'
import POPUPS from './POPUPS.js'
import * as MOUSE from './MOUSE.js'

const action_bar = document.getElementById('action-bar')

const char_display = ['name', 'height', 'speed']
// const inv_display = []

function init(){

	init_action_buttons()
	init_character_buttons()
	
}


function init_character_buttons(){

	const char_pop = new Popup({
		id: 'character'
	})
	char_pop.render = function(){

		for( const key of Object.keys( TOON )){

			if( char_display.includes( key )){

				let stat = document.createElement('div')
				stat.classList.add('stat')
				let stat_key = document.createElement('span')
				stat_key.classList.add('stat-key')
				stat_key.innerHTML = key
				stat.appendChild( stat_key )
				let stat_val = document.createElement('span')
				stat_val.classList.add('stat-val')
				stat_val.innerHTML = TOON[ key ]
				stat.appendChild( stat_val )
				
				stat.appendChild( document.createElement('br'))
				
				char_pop.content.appendChild( stat )

			}

		}

	}
	const inv_pop = new Popup({
		id: 'inventory'
	})
	inv_pop.render = function(){
		
		for( const arc_id of Object.keys( TOON.INVENTORY )){

			let item = TOON.INVENTORY[ arc_id ]

			let row = document.createElement('div')
			row.classList.add('stat')
			let icon = document.createElement('img')
			icon.classList.add('icon')
			icon.src = '/resource/images/icons/' + TOON.INVENTORY[ arc_id ].icon_url
			icon.addEventListener('click', function(){
				console.log( arc_id )
				MOUSE.mousehold.style.display = 'initial'
				MOUSE.mousehold.querySelector('img').src = icon.src
				// MOUSE.mousehold.setAttribute('data-held', )
				document.addEventListener('mousemove', mousetrack )
			})
			row.appendChild( icon )
			let stat_key = document.createElement('span')
			stat_key.classList.add('stat-key')
			stat_key.innerHTML = item.name
			row.appendChild( stat_key )
			// let stat_val = document.createElement('span')
			// stat_val.classList.add('stat-val')
			// stat_val.innerHTML = TOON[ key ]
			// stat.appendChild( stat_val )
			
			row.appendChild( document.createElement('br'))
			
			inv_pop.content.appendChild( row )

		}

	}

	const character_wrapper = document.createElement('div')
	character_wrapper.id = 'character-wrapper'

	const character = document.createElement('div')
	character.id = 'ab-character'
	character.classList.add('bar-button')
	character.addEventListener('click', function(){
		POPUPS['character'].show()
		// console.log(this.id + ' clicked')
	})

	character_wrapper.appendChild( character )

	const inventory = document.createElement('div')
	inventory.id = 'ab-inventory'
	inventory.classList.add('bar-button')
	inventory.addEventListener('click', function(){
		POPUPS['inventory'].show()
		// console.log(this.id + ' clicked')
	})

	character_wrapper.appendChild( inventory )

	action_bar.appendChild( character_wrapper )

}




function init_action_buttons(){
	const action_wrapper = document.createElement('div')
	action_wrapper.id = 'action-wrapper'

	for( let i = 0; i < 4; i++ ){
		const button = document.createElement('div')	
		button.classList.add('bar-button', 'action-button')
		button.addEventListener('click', function(){
			console.log('ab ' + i + ' clicked')
		})
		action_wrapper.appendChild( button )
	}
	action_bar.appendChild( action_wrapper )
}




function mousetrack(e){
	// console.log("we be trackin", e )
	MOUSE.mousehold.style.top = e.clientY + 'px'
	MOUSE.mousehold.style.left = e.clientX + 'px'
}


export {
	init
}