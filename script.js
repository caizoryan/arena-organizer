import { streamUserChannels, getUserChannels } from './arena.js'
import {reactive, memo} from './chowk.js'
import {dom} from './dom.js'
import { Keymanager } from './keymanager.js';
import { rename } from './rename.js';

// ------------------------
// DATA
// ------------------------
const allChannels = reactive([]);
const selectedChannels = reactive([])

const cursor = reactive(0)

const cursorNext = () => (cursor.value() < allChannels.value().length - 1 
	? cursor.next(e => e+1)
	: null, console.log("Called"))

const cursorPrev = () => cursor.value() > 0 
	? cursor.next(e => e-1)
	: null

// ------------------------
// Oranization
// ------------------------

// make this a changeable thing, so people can pick organization system
let parseIndexItem = (title) => title.split(" ")[0]?.trim()

// ----------------------------
// Grouping 
// ----------------------------
// functions
// ----------------------------
let groupByOwner = (channels) => {
	let grouped = {}
	channels.map(e => 
		grouped[e.owner.slug] 
			? grouped[e.owner.slug].push(e)
			: grouped[e.owner.slug] = [e])

	return Object.values(grouped).flat()
}

let groupByIndex = (channels) => {
	let grouped = {}
	channels.map(e => 
		grouped[parseIndexItem(e.title)] 
			? grouped[parseIndexItem(e.title)].push(e)
			: grouped[parseIndexItem(e.title)] = [e])

	return Object.values(grouped)
		.sort((a, b) =>  b.length - a.length )
		.flat()
}

let cycleGroupBy = () => {
	if (groupBy == groupByIndex) groupBy = groupByOwner
	else if (groupBy == groupByOwner) groupBy = groupByIndex
	groupByUpdated.next(e => e+1)
}
// ----------------------------
// data
// ----------------------------
let groupBy = groupByIndex
let groupByUpdated = reactive(0)
// ----------------------------

const channelsGrouped = memo(() => groupBy(allChannels.value()), [allChannels, groupByUpdated])
const channelsInView = channelsGrouped

function init(){
	streamUserChannels(
		// 'sanch-fish',
		// 'aaryan-pashine',
		// 'aaryan-arena-tests',
		'runa',
		(channels, meta) => {
			console.log(`Got page ${meta.current_page} of ${meta.total_pages}`, channels);

			channels = channels.map(channel => ({
				id:      channel.id,
				slug:      channel.slug,
				title:   channel.title,
				length:  channel.counts.contents,
				owner:   channel.owner,
				created: channel.created_at,
				updated: channel.updated_at,
			}));

			allChannels.next(e => [...e, ...channels]);
		},
		{ per: 100 }
	);
}

// Action schema
// type: rename | visibility | owner | copy
// properties: {
//   title,
//   visibility,
//   slug
// }

let selectChannel = channel => selectedChannels.next(e => (e.push(channel.slug), e))

let selectChannelAtIndex = index => selectChannel(channelAtIndex(index))
let unselectChannelAtIndex = index => unselectChannel(channelAtIndex(index))
let toggleChannelAtIndex = index => toggleChannel(channelAtIndex(index))

let unselectChannel = channel => selectedChannels.next(e => e.filter(f => f != channel.slug))
let toggleChannel = channel => isChannelSelected(channel) ? unselectChannel(channel) : selectChannel(channel)

let isChannelSelected = channel => selectedChannels.value().includes(channel.slug)
let isChannelHighlighted = index => cursor.value() == index

let channelAtIndex = index => channelsInView.value()[index]

// *side effect*
// *************
memo(() => {
	setTimeout(() => {
		let highlighted = document.querySelector('.channel-item[highlighted="true"]')
		if (highlighted) highlighted.scrollIntoView({behavior: "smooth", block: 'center'})
	}, 0)
}, [cursor])
// *************

// ------------------------
// VIEW
// ------------------------
let button = (t, fn) => ['button', {onclick: fn}, t]

let channelFullView = channel => 
	[['span', 
		['img', {style: 'height: 25px;', src:channel.owner.avatar }],
		['span', "   ("+channel.owner.initials+") "]],
	['span', `${channel.title}`],
	['span', `(${channel.length})`]]

let channelSmallView = channel => [
	['img', {style: 'height: 25px;', src:channel.owner.avatar }], ['span', `${channel.title}`]
]

let channelItem = (channel, index) =>
['p.channel-item', 
		{
			selected: memo(() => isChannelSelected(channel), [selectedChannels]),
			highlighted: memo(() => isChannelHighlighted(index), [cursor]),
			onclick: () => toggleChannel(channel)
		},
		...channelFullView(channel)
]

let selectionItem = (channel, index) => 
	['.channel-item', 
		memo(() => {
			let c = {...channel}
			c.title = rename.replaceFirst(c.title, replaceText.value(), replaceWith.value()) 
			return channelSmallView(c)
		}, [replaceWith, replaceText, selectedChannels])]

let channelList = memo(() => 
	['.channels', ...channelsInView.value().map(channelItem)],
	[channelsGrouped])

let replaceText = reactive('')
let replaceWith = reactive('')

let selectionList = memo(() =>  
	['.selections', 
		['.channel-list', 
			...allChannels.value()
			.filter(e => isChannelSelected(e)).map(selectionItem)
		],
		['.actions',
			['h4', "Rename"], 
			['.input-field',
				['span', "Replace Text: "],
				['input', {type: 'text', value: replaceText, oninput: e => replaceText.next(e.target.value)}]], 
			['.input-field',
				['span', "Replace With: "],
				['input', {type: 'text', value: replaceWith, oninput: e => replaceWith.next(e.target.value)}]]]
	],
	[selectedChannels])

let mode = reactive('list')

let root = ['main',
	['.top-bar',
		button('sort'),
		button('group-by', cycleGroupBy),
		button('filter'),
		button('Selection Mode', () => mode.next('select')),
		button('List Mode', () => mode.next('list')),
	],
	['.channel-container', {mode},
		channelList,
		selectionList,
	]
]

document.body.appendChild(dom(root))
init()

let keys = new Keymanager()
let prevent = { preventDefault: true };
let disableInputAndPrevent = {disable_in_input: true, preventDefault: true}
let disableInput = {disable_in_input: true}

let shiftUp = () => {
	unselectChannelAtIndex(cursor.value())
	cursorPrev()
}

let shiftDown = () => {
	selectChannelAtIndex(cursor.value())
	cursorNext()
	selectChannelAtIndex(cursor.value())
}

keys.on("j", cursorNext, disableInputAndPrevent)
keys.on("ArrowDown", cursorNext, disableInputAndPrevent)
keys.on("Shift + ArrowDown", shiftDown, disableInputAndPrevent)
keys.on("Shift + j", shiftDown, disableInputAndPrevent)

keys.on("ArrowUp", cursorPrev, disableInputAndPrevent)
keys.on("k", cursorPrev, disableInputAndPrevent)
keys.on("Shift + ArrowUp",shiftUp, disableInputAndPrevent)
keys.on("Shift + k",shiftUp, disableInputAndPrevent)

keys.on("space", () => toggleChannelAtIndex(cursor.value()), disableInputAndPrevent)

document.onkeydown = (e) =>  keys.event(e)
