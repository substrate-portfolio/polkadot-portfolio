# polkadot-portfolio 🤑

A CLI tool to find all your bags of tokens im the highly complicated world of Polkadot Ecosystem 🔴.

https://user-images.githubusercontent.com/5588131/154768918-c4985996-02b6-4def-a7f1-80c07c86a4e6.mov

> Example execution from the below `example.json`.

The basis of the code is as follows: This codebase supports a set of *pallets* that could bear some
value (aka. bags of tokens). Next, a configuration file specifies a number of WS endpoints to scan.
If any of these supported pallets exist in any of these endpoints, all of your provided accounts are
checked for bearing some value in that pallet.

The main advantage of this is reusing the reusability power of substrate. For example, almost all
(para)chains contain some value in the `frame_system` pallet. Moreover, if a chain like `Karura` is
supported, supporting `Acala` is already done out of the box, since they share the same underlying
pallets.

Lastly. for most newly launching parachain, if they only use basic pallets like `frame_system`, they
can be supported with no additional effort.

The program needs to be configured a config file, like `example.json` as a command line argument. 




```
{
	"wss://karura-rpc-0.aca-api.network": {
		"chain": "karura",
		"stashes": [
			["rcUEwGx4TfAcwtsThSJcpY1shzUfHSMfqV4jULZEgge3uYD", "account1"]
		]
	},

	"wss://statemine-rpc.polkadot.io": {
		"chain": "statemine",
		"stashes": [
			["HKKT5DjFaUE339m7ZWS2yutjecbUpBcDQZHw2EF7SFqSFJH", "RMRK-MultiSIG"]
		]
	},

	"wss://kusama-rpc.polkadot.io": {
		"chain": "kusama",
		"stashes": [
			["HL8bEp8YicBdrUmJocCAWVLKUaR2dd1y6jnD934pbre3un1", "ksm-ctrl"],
			["Eqm6aUjJDEWGAPfvFNpQcDgTSL44SuTCo1uFX7RwBwic74h", "ksm-2"]
		]
	},

	"wss://wss.api.moonbeam.network": {
		"chain": "moonbeam",
		"stashes": [
			["0x8E9D48d936768237D6aD9378026bF4Bc7ECBC4bc", "eth"]
		]
	},

	"wss://rpc.polkadot.io": {
		"chain": "polkadot",
		"stashes": [
			["16FH7GKMqRY6QSYFF1doUL5D9uYwhbNd7rkuu6hAtDDTnbzE", "account1"],
			["Cb2QccEAM38pjwmcHHTTuTukUobTHwhakKH4kBo4k8Vur8o", "account2"]
		]
	}
}
```

Once you have assets in any new chain, you simply need to tweak this file with that chain's websocket endpoint, and your accounts in that chain. 
