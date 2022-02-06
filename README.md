# polkadot-portfolio 🤑

A CLI tool to find all your bags of tokens im the highly complicated world of Polkadot Ecosystem 🔴.

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

The program needs to be configured a config file like called `accounts.json`, placed at the root directory:

```
{
	"<chain_ws_endpoint>": {
		"chain": "<chain_name>",
		// Optional: Provide this if the `chain_name` is not something that can be used
		// to fetch price from coingecko.
		"overwrite_currency_name": "<token_name>",
		"stashes": [
			["<account_ss58>", "<account_nickname>"],
			["<account_ss58>", "<account_nickname>"],
			...
		]
	}
}
```
