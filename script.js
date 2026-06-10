import { streamUserChannels, getUserChannels } from './arena.js'
import {reactive, memo} from './chowk.js'
import {dom} from './dom.js'

// ------------------------
// DATA
// ------------------------
const allChannels = reactive([]);
const selectedChannels = reactive([])

const cursor = reactive(0)

const cursorNext = () => cursor.value() < allChannels.value().length - 1 
	? cursor.next(e => e+1)
	: null

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

let selectChannel = channel => selectedChannels.next(e => (e.push(channel.slug), e))
let unselectChannel = channel => selectedChannels.next(e => e.filter(f => f != channel.slug))
let toggleChannel = channel => isChannelSelected(channel) ? unselectChannel(channel) : selectChannel(channel)
let isChannelSelected = channel => selectedChannels.value().includes(channel.slug)
let isChannelHighlighted = index => cursor.value() == index

let channelItem = (channel, index) =>
['p.channel-item', 
		{
			selected: memo(() => isChannelSelected(channel), [selectedChannels]),
			highlighted: memo(() => isChannelHighlighted(index), [cursor]),
			onclick: () => toggleChannel(channel)
		},
	['span', 
		['img', {style: 'height: 25px;', src:channel.owner.avatar }],
		['span', "   ("+channel.owner.initials+") "]],
		['span', `${channel.title}`],
		['span', `(${channel.length})`],
]

let channelList = memo(() => 
	['.channels', ...channelsGrouped.value().map(channelItem)], [channelsGrouped])

let button = (t, fn) => ['button', {onclick: fn}, t]

let root = ['main',
	['.top-bar',
		button('sort'),
		button('group-by', cycleGroupBy),
		button('filter')
	],
	['.channel-container',
		channelList]
]

document.body.appendChild(dom(root))
init()
