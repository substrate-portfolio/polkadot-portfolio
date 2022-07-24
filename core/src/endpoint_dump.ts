// Someday this fill shall be replaced with apps-config.

export interface EndpointOption {
	dnslink?: string;
	genesisHash?: string;
	homepage?: string;
	isChild?: boolean;
	isDevelopment?: boolean;
	isDisabled?: boolean;
	isUnreachable?: boolean;
	linked?: EndpointOption[];
	info?: string;
	paraId?: number;
	providers: Record<string, string>;
	summary?: string;
	teleport?: number[];
	text: string;
}

export interface LinkOption {
	dnslink?: string;
	genesisHash?: string;
	genesisHashRelay?: string;
	homepage?: string;
	isChild?: boolean;
	isDevelopment?: boolean;
	isLightClient?: boolean;
	isRelay?: boolean;
	isUnreachable?: boolean;
	isSpaced?: boolean;
	linked?: LinkOption[];
	paraId?: number;
	summary?: string;
	teleport?: number[];
	textBy: string;
	value: string;
	valueRelay?: string[];
}

export const prodParasKusama: EndpointOption[] = [
	{
		info: 'altair',
		homepage: 'https://centrifuge.io/altair',
		paraId: 2088,
		text: 'Altair',
		providers: {
			Centrifuge: 'wss://fullnode.altair.centrifuge.io',
			OnFinality: 'wss://altair.api.onfinality.io/public-ws'
		}
	},
	{
		info: 'amplitude',
		homepage: 'https://pendulumchain.org/amplitude',
		paraId: 2124,
		text: 'Amplitude',
		isUnreachable: true,
		providers: {} // Working on making this live ASAP
	},
	{
		info: 'bajun',
		homepage: 'https://ajuna.io',
		paraId: 2119,
		text: 'Bajun Network',
		providers: {
			AjunaNetwork: 'wss://rpc-parachain.bajun.network'
		}
	},
	{
		info: 'basilisk',
		homepage: 'https://bsx.fi',
		paraId: 2090,
		text: 'Basilisk',
		providers: {
			HydraDX: 'wss://rpc-01.basilisk.hydradx.io',
			OnFinality: 'wss://basilisk.api.onfinality.io/public-ws',
			Dwellir: 'wss://basilisk-rpc.dwellir.com'
		}
	},
	{
		info: 'bifrost',
		homepage: 'https://ksm.vtoken.io/?ref=polkadotjs',
		paraId: 2001,
		text: 'Bifrost',
		providers: {
			'Liebi 0': 'wss://bifrost-rpc.liebi.com/ws',
			'Liebi 1': 'wss://us.bifrost-rpc.liebi.com/ws',
			'Liebi 2': 'wss://eu.bifrost-rpc.liebi.com/ws',
			OnFinality: 'wss://bifrost-parachain.api.onfinality.io/public-ws',
			Dwellir: 'wss://bifrost-rpc.dwellir.com'
		}
	},
	{
		info: 'bitcountryPioneer',
		homepage: 'https://bit.country/?ref=polkadotjs',
		paraId: 2096,
		text: 'Bit.Country Pioneer',
		providers: {
			'Bit.Country': 'wss://pioneer-1-rpc.bit.country',
			OnFinality: 'wss://pioneer.api.onfinality.io/public-ws'
		}
	},
	{
		info: 'calamari',
		homepage: 'https://www.calamari.network/',
		paraId: 2084,
		text: 'Calamari',
		providers: {
			'Manta Network': 'wss://ws.calamari.systems/',
			OnFinality: 'wss://calamari.api.onfinality.io/public-ws'
		}
	},
	{
		info: 'shadow',
		homepage: 'https://crust.network/',
		paraId: 2012,
		text: 'Crust Shadow',
		providers: {
			Crust: 'wss://rpc-shadow.crust.network/'
		}
	},
	{
		info: 'crab',
		homepage: 'https://crab.network',
		paraId: 2105,
		text: 'Darwinia Crab Parachain',
		providers: {
			Crab: 'wss://crab-parachain-rpc.darwinia.network/'
		}
	},
	{
		info: 'dorafactory',
		homepage: 'https://dorafactory.org/kusama/',
		paraId: 2115,
		text: 'Dora Factory',
		providers: {
			DORA: 'wss://kusama.dorafactory.org'
		}
	},
	{
		info: 'genshiro',
		homepage: 'https://genshiro.equilibrium.io',
		isUnreachable: true, // https://github.com/polkadot-js/apps/pull/6761
		paraId: 2024,
		text: 'Genshiro',
		providers: {
			Equilibrium: 'wss://node.genshiro.io'
		}
	},
	{
		info: 'gm',
		isUnreachable: true,
		homepage: 'https://gmordie.com',
		paraId: 2123,
		text: 'GM Parachain',
		providers: {
			GMorDieDAO: 'wss://kusama.gmordie.com'
		}
	},
	{
		info: 'imbue',
		homepage: 'https://imbue.network',
		paraId: 2121,
		text: 'Imbue Network',
		providers: {
			'Imbue Network': 'wss://imbue-kusama.imbue.network'
		}
	},
	{
		info: 'integritee',
		homepage: 'https://integritee.network',
		paraId: 2015,
		text: 'Integritee Network',
		providers: {
			Integritee: 'wss://kusama.api.integritee.network',
			OnFinality: 'wss://integritee-kusama.api.onfinality.io/public-ws'
		}
	},
	{
		info: 'tinker',
		homepage: 'https://invarch.network/tinkernet',
		paraId: 2125,
		text: 'InvArch Tinkernet',
		providers: {
			'InvArch Team': 'wss://tinker.invarch.network'
		}
	},
	{
		info: 'kabocha',
		homepage: 'https://kabocha.network',
		paraId: 2113,
		text: 'Kabocha',
		providers: {
			JelliedOwl: 'wss://kabocha.jelliedowl.com'
		}
	},
	{
		info: 'karura',
		homepage: 'https://acala.network/karura/join-karura',
		paraId: 2000,
		text: 'Karura',
		providers: {
			'Acala Foundation 0': 'wss://karura-rpc-0.aca-api.network',
			'Acala Foundation 1': 'wss://karura-rpc-1.aca-api.network',
			'Acala Foundation 2': 'wss://karura-rpc-2.aca-api.network/ws',
			'Acala Foundation 3': 'wss://karura-rpc-3.aca-api.network/ws',
			'Polkawallet 0': 'wss://karura.polkawallet.io',
			OnFinality: 'wss://karura.api.onfinality.io/public-ws',
			Dwellir: 'wss://karura-rpc.dwellir.com'
		}
	},
	{
		info: 'khala',
		homepage: 'https://phala.network/',
		paraId: 2004,
		text: 'Khala Network',
		providers: {
			Phala: 'wss://khala-api.phala.network/ws',
			OnFinality: 'wss://khala.api.onfinality.io/public-ws',
			Dwellir: 'wss://khala-rpc.dwellir.com',
			Pinknode: 'wss://public-rpc.pinknode.io/khala'
		}
	},
	{
		info: 'kico',
		homepage: 'https://dico.io/',
		paraId: 2107,
		text: 'KICO',
		providers: {
			'DICO Foundation': 'wss://rpc.kico.dico.io',
			'DICO Foundation 2': 'wss://rpc.api.kico.dico.io'
		}
	},
	{
		info: 'kilt',
		homepage: 'https://www.kilt.io/',
		paraId: 2086,
		text: 'KILT Spiritnet',
		providers: {
			'KILT Protocol': 'wss://spiritnet.kilt.io/',
			OnFinality: 'wss://spiritnet.api.onfinality.io/public-ws',
			Dwellir: 'wss://kilt-rpc.dwellir.com'
		}
	},
	{
		info: 'kintsugi',
		homepage: 'https://kintsugi.interlay.io/',
		paraId: 2092,
		text: 'Kintsugi BTC',
		providers: {
			'Kintsugi Labs': 'wss://api-kusama.interlay.io/parachain',
			OnFinality: 'wss://kintsugi.api.onfinality.io/public-ws',
			Dwellir: 'wss://kintsugi-rpc.dwellir.com'
		}
	},
	{
		info: 'kpron',
		homepage: 'http://apron.network/',
		isUnreachable: true,
		paraId: 2019,
		text: 'Kpron',
		providers: {
			Kpron: 'wss://kusama-kpron-rpc.apron.network/'
		}
	},
	{
		info: 'listen',
		homepage: 'https://listen.io/',
		paraId: 2118,
		text: 'Listen Network',
		providers: {
			'Listen Foundation 1': 'wss://rpc.mainnet.listen.io',
			'Listen Foundation 2': 'wss://wss.mainnet.listen.io'
		}
	},
	{
		info: 'litmus',
		homepage: 'https://kusama-crowdloan.litentry.com',
		paraId: 2106,
		isUnreachable: false,
		text: 'Litmus',
		providers: {
			Litentry: 'wss://rpc.litmus-parachain.litentry.io'
		}
	},
	{
		info: 'loomNetwork',
		isUnreachable: true, // https://github.com/polkadot-js/apps/issues/5888
		homepage: 'https://loomx.io/',
		paraId: 2080,
		text: 'Loom Network',
		providers: {
			LoomNetwork: 'wss://kusama.dappchains.com'
		}
	},
	{
		info: 'mangata',
		homepage: 'https://mangata.finance',
		paraId: 2110,
		text: 'Mangata',
		providers: {
			Mangata: 'wss://prod-kusama-collator-01.mangatafinance.cloud',
			OnFinality: 'wss://mangata-x.api.onfinality.io/public-ws'
		}
	},
	{
		info: 'mars',
		homepage: 'https://www.aresprotocol.io/mars',
		paraId: 2008,
		text: 'Mars',
		providers: {
			AresProtocol: 'wss://wss.mars.aresprotocol.io'
		}
	},
	{
		info: 'moonriver',
		homepage: 'https://moonbeam.network/networks/moonriver/',
		paraId: 2023,
		text: 'Moonriver',
		providers: {
			'Moonbeam Foundation': 'wss://wss.api.moonriver.moonbeam.network',
			Blast: 'wss://moonriver.public.blastapi.io',
			Dwellir: 'wss://moonriver-rpc.dwellir.com',
			OnFinality: 'wss://moonriver.api.onfinality.io/public-ws',
			Pinknode: 'wss://public-rpc.pinknode.io/moonriver'
			// Pinknode: 'wss://rpc.pinknode.io/moonriver/explorer' // https://github.com/polkadot-js/apps/issues/7058
		}
	},
	{
		info: 'heiko',
		homepage: 'https://parallel.fi',
		paraId: 2085,
		text: 'Parallel Heiko',
		providers: {
			OnFinality: 'wss://parallel-heiko.api.onfinality.io/public-ws',
			Parallel: 'wss://heiko-rpc.parallel.fi'
		}
	},
	{
		info: 'heiko',
		homepage: 'https://parallel.fi',
		paraId: 2126,
		isUnreachable: true,
		text: 'Parallel Heiko 2',
		providers: {}
	},
	{
		info: 'picasso',
		homepage: 'https://picasso.composable.finance/',
		paraId: 2087,
		text: 'Picasso',
		providers: {
			Composable: 'wss://picasso-rpc.composable.finance',
			Dwellir: 'wss://picasso-rpc.dwellir.com'
		}
	},
	{
		info: 'pichiu',
		homepage: 'https://kylin.network/',
		paraId: 2102,
		text: 'Pichiu',
		providers: {
			'Kylin Network': 'wss://kusama.kylin-node.co.uk'
		}
	},
	{
		info: 'polkasmith',
		isUnreachable: true, // https://github.com/polkadot-js/apps/issues/6595
		homepage: 'https://polkasmith.polkafoundry.com/',
		paraId: 2009,
		text: 'PolkaSmith by PolkaFoundry',
		providers: {
			PolkaSmith: 'wss://wss-polkasmith.polkafoundry.com'
		}
	},
	{
		info: 'quartz',
		homepage: 'https://unique.network/',
		paraId: 2095,
		text: 'QUARTZ by UNIQUE',
		providers: {
			OnFinality: 'wss://quartz.api.onfinality.io/public-ws',
			'Unique America': 'wss://us-ws-quartz.unique.network',
			'Unique Asia': 'wss://asia-ws-quartz.unique.network',
			'Unique Europe': 'wss://eu-ws-quartz.unique.network'
		}
	},
	{
		info: 'robonomics',
		homepage: 'http://robonomics.network/',
		paraId: 2048,
		text: 'Robonomics',
		providers: {
			Airalab: 'wss://kusama.rpc.robonomics.network/',
			OnFinality: 'wss://robonomics.api.onfinality.io/public-ws'
		}
	},
	{
		info: 'sakura',
		homepage: 'https://clover.finance/',
		isUnreachable: true,
		paraId: 2016,
		text: 'Sakura',
		providers: {
			Clover: 'wss://api-sakura.clover.finance'
		}
	},
	{
		info: 'shiden',
		homepage: 'https://shiden.astar.network/',
		paraId: 2007,
		text: 'Shiden',
		providers: {
			StakeTechnologies: 'wss://rpc.shiden.astar.network',
			OnFinality: 'wss://shiden.api.onfinality.io/public-ws',
			Pinknode: 'wss://public-rpc.pinknode.io/shiden',
			Dwellir: 'wss://shiden-rpc.dwellir.com'
		}
	},
	{
		info: 'shiden',
		homepage: 'https://shiden.astar.network/',
		paraId: 2120,
		text: 'Shiden Crowdloan 2',
		isUnreachable: true,
		providers: {
			StakeTechnologies: 'wss://rpc.shiden.astar.network'
		}
	},
	{
		info: 'sora_ksm',
		homepage: 'https://sora.org/',
		paraId: 2011,
		text: 'SORA Kusama Parachain',
		providers: {
			Soramitsu: 'wss://ws.parachain-collator-1.c1.sora2.soramitsu.co.jp'
		}
	},
	{
		info: 'subgame',
		homepage: 'http://subgame.org/',
		paraId: 2018,
		text: 'SubGame Gamma',
		providers: {
			SubGame: 'wss://gamma.subgame.org/'
		}
	},
	{
		info: 'subsocialX',
		homepage: 'https://subsocial.network/',
		paraId: 2100,
		text: 'SubsocialX',
		providers: {
			Dappforce: 'wss://para.subsocial.network'
		}
	},
	{
		info: 'tanganika',
		homepage: 'https://www.datahighway.com/',
		paraId: 2116,
		text: 'Tanganika',
		providers: {
			DataHighway: 'wss://tanganika.datahighway.com'
		}
	},
	{
		info: 'trustbase',
		isUnreachable: true, // no providers (yet)
		homepage: 'https://trustbase.network/',
		paraId: 2078,
		text: 'TrustBase',
		providers: {}
	},
	{
		info: 'turing',
		homepage: 'https://oak.tech',
		paraId: 2114,
		text: 'Turing Network',
		providers: {
			OAK: 'wss://rpc.turing.oak.tech',
			OnFinality: 'wss://turing.api.onfinality.io/public-ws',
			Dwellir: 'wss://turing-rpc.dwellir.com'
		}
	},
	{
		info: 'unorthodox',
		homepage: 'https://standard.tech/',
		paraId: 2094,
		text: 'Unorthodox',
		providers: {
			'Standard Protocol': 'wss://rpc.kusama.standard.tech'
		}
	},
	{
		info: 'zeitgeist',
		homepage: 'https://zeitgeist.pm',
		paraId: 2101,
		text: 'Zeitgeist',
		providers: {
			ZeitgeistPM: 'wss://rpc-0.zeitgeist.pm',
			Dwellir: 'wss://zeitgeist-rpc.dwellir.com',
			OnFinality: 'wss://zeitgeist.api.onfinality.io/public-ws'
		}
	}
];

export const prodParasKusamaCommon: EndpointOption[] = [
	{
		info: 'statemine',
		paraId: 1000,
		text: 'Statemine',
		providers: {
			Parity: 'wss://statemine-rpc.polkadot.io',
			OnFinality: 'wss://statemine.api.onfinality.io/public-ws',
			Dwellir: 'wss://statemine-rpc.dwellir.com',
			Pinknode: 'wss://public-rpc.pinknode.io/statemine'
		},
		teleport: [-1]
	},
	{
		info: 'encointer',
		homepage: 'https://encointer.org/',
		paraId: 1001,
		text: 'Encointer Network',
		providers: {
			'Encointer Association': 'wss://kusama.api.encointer.org',
			OnFinality: 'wss://encointer.api.onfinality.io/public-ws'
		},
		teleport: [-1]
	}
];

export const prodRelayKusama: EndpointOption = {
	dnslink: 'kusama',
	info: 'kusama',
	text: 'Kusama',
	providers: {
		Parity: 'wss://kusama-rpc.polkadot.io',
		OnFinality: 'wss://kusama.api.onfinality.io/public-ws',
		Dwellir: 'wss://kusama-rpc.dwellir.com',
		RadiumBlock: 'wss://kusama.public.curie.radiumblock.xyz/ws',
		Pinknode: 'wss://public-rpc.pinknode.io/kusama',
		// 'Geometry Labs': 'wss://kusama.geometry.io/websockets', // https://github.com/polkadot-js/apps/pull/6746
		'light client': 'light://substrate-connect/kusama'
	},
	teleport: [1000, 1001],
	linked: [...prodParasKusamaCommon, ...prodParasKusama]
};

export const prodParasPolkadot: EndpointOption[] = [
	{
		info: 'acala',
		homepage: 'https://acala.network/',
		paraId: 2000,
		text: 'Acala',
		providers: {
			'Acala Foundation 0': 'wss://acala-rpc-0.aca-api.network',
			'Acala Foundation 1': 'wss://acala-rpc-1.aca-api.network',
			// 'Acala Foundation 2': 'wss://acala-rpc-2.aca-api.network/ws', // https://github.com/polkadot-js/apps/issues/6965
			'Acala Foundation 3': 'wss://acala-rpc-3.aca-api.network/ws',
			'Polkawallet 0': 'wss://acala.polkawallet.io',
			OnFinality: 'wss://acala-polkadot.api.onfinality.io/public-ws',
			Dwellir: 'wss://acala-rpc.dwellir.com'
		}
	},
	{
		info: 'odyssey',
		homepage: 'https://www.aresprotocol.io/',
		paraId: 2028,
		text: 'Ares Odyssey',
		providers: {
			AresProtocol: 'wss://wss.odyssey.aresprotocol.io'
		}
	},
	{
		info: 'astar',
		homepage: 'https://astar.network',
		paraId: 2006,
		text: 'Astar',
		providers: {
			Astar: 'wss://rpc.astar.network',
			OnFinality: 'wss://astar.api.onfinality.io/public-ws',
			Dwellir: 'wss://astar-rpc.dwellir.com',
			Pinknode: 'wss://public-rpc.pinknode.io/astar'
		}
	},
	{
		info: 'bifrost',
		homepage: 'https://crowdloan.bifrost.app',
		paraId: 2030,
		text: 'Bifrost',
		providers: {
			Liebi: 'wss://hk.p.bifrost-rpc.liebi.com/ws'
		}
	},
	{
		info: 'centrifuge',
		homepage: 'https://centrifuge.io',
		paraId: 2031,
		text: 'Centrifuge',
		providers: {
			Centrifuge: 'wss://fullnode.parachain.centrifuge.io',
			OnFinality: 'wss://centrifuge-parachain.api.onfinality.io/public-ws'
		}
	},
	{
		info: 'clover',
		homepage: 'https://clover.finance',
		paraId: 2002,
		text: 'Clover',
		providers: {
			Clover: 'wss://rpc-para.clover.finance',
			OnFinality: 'wss://clover.api.onfinality.io/public-ws'
		}
	},
	{
		// this is also a duplicate as a Live and Testing network -
		// it is either/or, not and
		info: 'coinversation',
		isUnreachable: true, // https://github.com/polkadot-js/apps/issues/6635
		homepage: 'http://www.coinversation.io/',
		paraId: 2027,
		text: 'Coinversation',
		providers: {
			Coinversation: 'wss://rpc.coinversation.io/'
		}
	},
	{
		info: 'composableFinance',
		homepage: 'https://composable.finance/',
		paraId: 2019,
		text: 'Composable Finance',
		providers: {
			Composable: 'wss://rpc.composable.finance',
			Dwellir: 'wss://composable-rpc.dwellir.com'
		}
	},
	{
		info: 'crustParachain',
		homepage: 'https://crust.network',
		paraId: 2008,
		isUnreachable: true,
		text: 'Crust',
		providers: {
			Crust: 'wss://rpc.crust.network'
		}
	},
	{
		info: 'darwinia',
		homepage: 'https://darwinia.network/',
		paraId: 2046,
		text: 'Darwinia',
		providers: {
			Darwinia: 'wss://parachain-rpc.darwinia.network'
		}
	},
	{
		info: 'darwinia',
		isUnreachable: true, // https://github.com/polkadot-js/apps/issues/6530
		homepage: 'https://darwinia.network/',
		paraId: 2003,
		text: 'Darwinia Para Backup',
		providers: {
			Darwinia: 'wss://parachain-rpc.darwinia.network'
		}
	},
	{
		info: 'efinity',
		homepage: 'https://efinity.io',
		paraId: 2021,
		text: 'Efinity',
		providers: {
			Efinity: 'wss://rpc.efinity.io'
		}
	},
	{
		info: 'equilibrium',
		homepage: 'https://equilibrium.io/',
		paraId: 2011,
		text: 'Equilibrium',
		providers: {
			Equilibrium: 'wss://node.pol.equilibrium.io/'
		}
	},
	{
		info: 'geminis',
		isUnreachable: true,
		homepage: 'https://geminis.network/',
		paraId: 2038,
		text: 'Geminis',
		providers: {
			Geminis: 'wss://rpc.geminis.network'
		}
	},
	{
		info: 'hydra',
		homepage: 'https://hydradx.io/',
		paraId: 2034,
		text: 'HydraDX',
		providers: {
			'Galactic Council': 'wss://rpc-01.hydradx.io',
			Dwellir: 'wss://hydradx-rpc.dwellir.com'
		}
	},
	{
		info: 'integritee',
		homepage: 'https://integritee.network',
		paraId: 2039,
		text: 'Integritee Shell',
		providers: {
			Integritee: 'wss://polkadot.api.integritee.network'
		}
	},
	{
		info: 'interlay',
		homepage: 'https://interlay.io/',
		paraId: 2032,
		text: 'Interlay',
		providers: {
			'Kintsugi Labs': 'wss://api.interlay.io/parachain',
			OnFinality: 'wss://interlay.api.onfinality.io/public-ws'
		}
	},
	{
		info: 'kapex',
		homepage: 'https://totemaccounting.com/',
		paraId: 2007,
		text: 'Kapex',
		providers: {
			Totem: 'wss://k-ui.kapex.network'
		}
	},
	{
		info: 'kylin',
		homepage: 'https://kylin.network/',
		paraId: 2052,
		text: 'Kylin',
		providers: {
			'Kylin Network': 'wss://polkadot.kylin-node.co.uk'
		}
	},
	{
		info: 'litentry',
		homepage: 'https://crowdloan.litentry.com',
		paraId: 2013,
		text: 'Litentry',
		providers: {
			Litentry: 'wss://rpc.litentry-parachain.litentry.io',
			Dwellir: 'wss://litentry-rpc.dwellir.com'
		}
	},
	{
		info: 'manta',
		isUnreachable: true, // https://github.com/polkadot-js/apps/issues/7018
		homepage: 'https://manta.network',
		paraId: 2015,
		text: 'Manta',
		providers: {
			// 'Manta Kuhlii': 'wss://kuhlii.manta.systems', // https://github.com/polkadot-js/apps/issues/6930
			// 'Manta Munkiana': 'wss://munkiana.manta.systems', // https://github.com/polkadot-js/apps/issues/6871
			// 'Manta Pectinata': 'wss://pectinata.manta.systems' // https://github.com/polkadot-js/apps/issues/7018
		}
	},
	{
		info: 'moonbeam',
		homepage: 'https://moonbeam.network/networks/moonbeam/',
		paraId: 2004,
		text: 'Moonbeam',
		providers: {
			'Moonbeam Foundation': 'wss://wss.api.moonbeam.network',
			Blast: 'wss://moonbeam.public.blastapi.io',
			Dwellir: 'wss://moonbeam-rpc.dwellir.com',
			OnFinality: 'wss://moonbeam.api.onfinality.io/public-ws',
			Pinknode: 'wss://public-rpc.pinknode.io/moonbeam'
		}
	},
	{
		info: 'nodle',
		homepage: 'https://nodle.com',
		paraId: 2026,
		text: 'Nodle',
		providers: {
			OnFinality: 'wss://nodle-parachain.api.onfinality.io/public-ws',
			Dwellir: 'wss://eden-rpc.dwellir.com',
			Pinknode: 'wss://public-rpc.pinknode.io/nodle'
		}
	},
	{
		info: 'omnibtc',
		isUnreachable: true,
		homepage: 'https://www.omnibtc.finance',
		text: 'OmniBTC',
		paraId: 2053,
		providers: {
			OmniBTC: 'wss://omnibtc.io/ws'
		}
	},
	{
		info: 'origintrail-parachain',
		homepage: 'https://parachain.origintrail.io',
		text: 'OriginTrail Parachain',
		paraId: 2043,
		providers: {
			TraceLabs: 'wss://parachain-rpc.origin-trail.network'
		}
	},
	{
		info: 'parallel',
		homepage: 'https://parallel.fi',
		paraId: 2012,
		text: 'Parallel',
		providers: {
			OnFinality: 'wss://parallel.api.onfinality.io/public-ws',
			Parallel: 'wss://rpc.parallel.fi'
		}
	},
	{
		info: 'phala',
		homepage: 'https://phala.network',
		paraId: 2035,
		text: 'Phala Network',
		providers: {
			Phala: 'wss://api.phala.network/ws'
		}
	},
	{
		info: 'polkadex',
		isUnreachable: true, // https://github.com/polkadot-js/apps/issues/7620
		homepage: 'https://polkadex.trade/',
		paraId: 2040,
		text: 'Polkadex',
		providers: {
			// 'Polkadex Team': 'wss://mainnet.polkadex.trade/', // https://github.com/polkadot-js/apps/issues/7620
			// OnFinality: 'wss://polkadex.api.onfinality.io/public-ws' // https://github.com/polkadot-js/apps/issues/7620
		}
	},
	{
		info: 'subdao',
		homepage: 'https://subdao.network/',
		paraId: 2018,
		isUnreachable: true,
		text: 'SubDAO',
		providers: {
			SubDAO: 'wss://parachain-rpc.subdao.org'
		}
	},
	{
		info: 'subgame',
		homepage: 'http://subgame.org/',
		isUnreachable: true, // https://github.com/polkadot-js/apps/pull/6761
		paraId: 2017,
		text: 'SubGame Gamma',
		providers: {
			SubGame: 'wss://gamma.subgame.org/'
		}
	},
	{
		info: 'unique',
		homepage: 'https://unique.network/',
		paraId: 2037,
		text: 'Unique Network',
		providers: {
			'Unique America': 'wss://us-ws.unique.network/',
			'Unique Asia': 'wss://asia-ws.unique.network/',
			'Unique Europe': 'wss://eu-ws.unique.network/'
		}
	}
];

export const prodParasPolkadotCommon: EndpointOption[] = [
	{
		info: 'statemint',
		paraId: 1000,
		text: 'Statemint',
		teleport: [-1],
		providers: {
			Parity: 'wss://statemint-rpc.polkadot.io',
			OnFinality: 'wss://statemint.api.onfinality.io/public-ws',
			Dwellir: 'wss://statemint-rpc.dwellir.com',
			Pinknode: 'wss://public-rpc.pinknode.io/statemint'
		}
	}
];

export const prodRelayPolkadot: EndpointOption = {
	dnslink: 'polkadot',
	info: 'polkadot',
	text: 'Polkadot',
	providers: {
		Parity: 'wss://rpc.polkadot.io',
		OnFinality: 'wss://polkadot.api.onfinality.io/public-ws',
		Dwellir: 'wss://polkadot-rpc.dwellir.com',
		Pinknode: 'wss://public-rpc.pinknode.io/polkadot',
		RadiumBlock: 'wss://polkadot.public.curie.radiumblock.io/ws',
		// 'Geometry Labs': 'wss://polkadot.geometry.io/websockets', // https://github.com/polkadot-js/apps/pull/6746
		'light client': 'light://substrate-connect/polkadot'
	},
	teleport: [1000],
	linked: [...prodParasPolkadotCommon, ...prodParasPolkadot]
};

export const prodChains: EndpointOption[] = [
	{
		info: 'aleph',
		text: 'Aleph Zero',
		providers: {
			'Aleph Zero Foundation': 'wss://ws.azero.dev'
		}
	},
	{
		info: 'Ares Odyssey',
		text: 'Ares Odyssey',
		providers: {
			'Ares Protocol': 'wss://odyssey.aresprotocol.io'
		}
	},
	{
		info: 'automata',
		text: 'Automata',
		providers: {
			'Automata Network': 'wss://api.ata.network',
			OnFinality: 'wss://automata.api.onfinality.io/public-ws'
		}
	},
	{
		dnslink: 'centrifuge',
		info: 'centrifuge',
		text: 'Centrifuge Standalone [Archived]',
		providers: {
			Centrifuge: 'wss://fullnode.centrifuge.io'
		}
	},
	{
		info: 'chainx',
		text: 'ChainX',
		providers: {
			ChainX: 'wss://mainnet.chainx.org/ws'
		}
	},
	{
		info: 'competitors-club',
		text: 'Competitors Club',
		providers: {
			'Competitors Club': 'wss://node0.competitors.club/wss'
		}
	},
	{
		info: 'creditcoin',
		text: 'Creditcoin',
		providers: {
			'Creditcoin Foundation': 'wss://mainnet.creditcoin.network'
		}
	},
	{
		info: 'crown-sterling',
		text: 'Crown Sterling',
		providers: {
			'Crown Sterling': 'wss://blockchain.crownsterling.io'
		}
	},
	{
		info: 'crust',
		text: 'Crust Network',
		providers: {
			'Crust Network': 'wss://rpc.crust.network',
			OnFinality: 'wss://crust.api.onfinality.io/public-ws'
		}
	},
	{
		info: 'darwinia',
		text: 'Darwinia',
		providers: {
			'Darwinia Network': 'wss://rpc.darwinia.network',
			Dwellir: 'wss://darwinia-rpc.dwellir.com'
		}
	},
	{
		info: 'crab',
		text: 'Darwinia Crab',
		providers: {
			'Darwinia Network': 'wss://crab-rpc.darwinia.network',
			Dwellir: 'wss://darwiniacrab-rpc.dwellir.com',
			OnFinality: 'wss://darwinia-crab.api.onfinality.io/public-ws'
		}
	},
	{
		info: 'dock-pos-mainnet',
		text: 'Dock',
		providers: {
			'Dock Association': 'wss://mainnet-node.dock.io'
		}
	},
	{
		dnslink: 'edgeware',
		info: 'edgeware',
		text: 'Edgeware',
		providers: {
			'Commonwealth Labs': 'wss://mainnet.edgewa.re',
			OnFinality: 'wss://edgeware.api.onfinality.io/public-ws',
			Dwellir: 'wss://edgeware-rpc.dwellir.com'
		}
	},
	{
		info: 'efinity',
		isDisabled: true, // https://github.com/polkadot-js/apps/pull/6761
		text: 'Efinity',
		providers: {
			Efinity: 'wss://rpc.efinity.io'
		}
	},
	{
		info: 'equilibrium',
		isDisabled: true, // https://github.com/polkadot-js/apps/issues/7219
		text: 'Equilibrium',
		providers: {
			Equilibrium: 'wss://node.equilibrium.io'
		}
	},
	{
		info: 'genshiro',
		text: 'Genshiro',
		providers: {
			Equilibrium: 'wss://node.genshiro.io'
		}
	},
	{
		info: 'hanonycash',
		isDisabled: true, // https://github.com/polkadot-js/apps/runs/2755409009?check_suite_focus=true
		text: 'Hanonycash',
		providers: {
			Hanonycash: 'wss://rpc.hanonycash.com'
		}
	},
	{
		dnslink: 'kulupu',
		info: 'kulupu',
		text: 'Kulupu',
		providers: {
			Kulupu: 'wss://rpc.kulupu.corepaper.org/ws'
		}
	},
	{
		info: 'kusari',
		text: 'Kusari',
		providers: {
			Swapdex: 'wss://ws.kusari.network'
		}
	},
	{
		info: 'logion',
		text: 'logion Standalone',
		providers: {
			Logion: 'wss://rpc01.logion.network'
		}
	},
	{
		info: 'mathchain',
		text: 'MathChain',
		providers: {
			MathWallet: 'wss://mathchain-asia.maiziqianbao.net/ws',
			'MathWallet Backup': 'wss://mathchain-us.maiziqianbao.net/ws'
		}
	},
	{
		info: 'minix',
		isDisabled: true, // https://github.com/polkadot-js/apps/issues/7182
		text: 'MiniX',
		providers: {
			ChainX: 'wss://minichain-mainnet.coming.chat/ws'
		}
	},
	{
		info: 'myriad',
		text: 'Myriad',
		providers: {
			Myriad: 'wss://ws-rpc.myriad.social'
		}
	},
	{
		info: 'neatcoin',
		text: 'Neatcoin',
		providers: {
			Neatcoin: 'wss://rpc.neatcoin.org/ws'
		}
	},
	{
		info: 'nftmart',
		text: 'NFTMart',
		providers: {
			NFTMart: 'wss://mainnet.nftmart.io/rpc/ws'
		}
	},
	{
		info: 'nodle',
		text: 'Nodle',
		providers: {
			// Nodle: 'wss://main3.nodleprotocol.io', // https://github.com/polkadot-js/apps/issues/7652
			OnFinality: 'wss://nodle.api.onfinality.io/public-ws'
		}
	},
	{
		info: 'polkadex',
		text: 'Polkadex',
		providers: {
			'Polkadex Team': 'wss://mainnet.polkadex.trade',
			OnFinality: 'wss://polkadex.api.onfinality.io/public-ws'
		}
	},
	{
		info: 'polymesh',
		text: 'Polymesh Mainnet',
		providers: {
			Polymath: 'wss://mainnet-rpc.polymesh.network'
		}
	},
	{
		info: 'riochain',
		text: 'RioChain',
		providers: {
			RioChain: 'wss://node.v1.riochain.io'
		}
	},
	{
		info: 'robonomics',
		isDisabled: true, // https://github.com/polkadot-js/apps/pull/6761
		text: 'Robonomics',
		providers: {
			Airalab: 'wss://kusama.rpc.robonomics.network/'
		}
	},
	{
		info: 'sherpax',
		text: 'SherpaX',
		providers: {
			ChainX: 'wss://mainnet.sherpax.io'
		}
	},
	{
		info: 'sora-substrate',
		text: 'SORA',
		providers: {
			'SORA Parliament Ministry of Finance #2': 'wss://mof2.sora.org',
			'SORA Parliament Ministry of Finance': 'wss://ws.mof.sora.org',
			'SORA Parliament Ministry of Finance #3': 'wss://mof3.sora.org',
			// Soramitsu: 'wss://ws.alb.sora.org', // https://github.com/polkadot-js/apps/issues/7786
			OnFinality: 'wss://sora.api.onfinality.io/public-ws'
			// 'SORA Community (Lux8)': 'wss://sora.lux8.net' // https://github.com/polkadot-js/apps/issues/6195
		}
	},
	{
		info: 'spanner',
		isDisabled: true, // https://github.com/polkadot-js/apps/issues/6547
		text: 'Spanner',
		providers: {
			Spanner: 'wss://wss.spannerprotocol.com'
		}
	},
	{
		info: 'stafi',
		isDisabled: true, // Cannot find type ChainId
		text: 'Stafi',
		providers: {
			'Stafi Foundation': 'wss://mainnet-rpc.stafi.io'
		}
	},
	{
		info: 'subgame',
		text: 'SubGame',
		providers: {
			SubGame: 'wss://mainnet.subgame.org/'
		}
	},
	{
		info: 'subsocial',
		text: 'Subsocial',
		providers: {
			DappForce: 'wss://rpc.subsocial.network'
		}
	},
	{
		info: 'swapdex',
		text: 'Swapdex',
		providers: {
			Swapdex: 'wss://ws.swapdex.network'
		}
	},
	{
		info: 'ternoa',
		text: 'Ternoa',
		providers: {
			CapsuleCorp: 'wss://mainnet.ternoa.network'
		}
	},
	{
		info: 'uniarts',
		text: 'UniArts',
		providers: {
			UniArts: 'wss://mainnet.uniarts.vip:9443'
		}
	},
	{
		info: 'westlake',
		isDisabled: true, // https://github.com/polkadot-js/apps/issues/7293
		text: 'Westlake',
		providers: {
			DataHighway: 'wss://westlake.datahighway.com'
		}
	}
];
