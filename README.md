# polkadot-portfolio

A WIP project to calculate your entire portfolio in the complicated Polkadot ecosystem.

The basis of it as follows: We assume certain pallets in substrate are value bearing. For example,
`pallet-balances`, `pallet-vesting` and `crowdloan` can all contain a chunk of your portfolio. Each
pallet will get its own dedicated piece of code to extract value from it. For each chain, we check
for the existence of any of these pallets. If so, the value in them is extracted.

You need to feed-in your accounts using a json file places at the root of the project, with a format
like:

```
{
	"<chain_ws_endpoint>": {
		"chain": "kusama",
		"stashes": [
			["<account_ss58>", "<account_nickname>"],
			["<account_ss58>", "<account_nickname>"],
			["<account_ss58>", "<account_nickname>"],
		]
	}
}

```

For example, you can fill in your accounts and the WS endpoint of Polkadot, Kusama, Statemine,
Karura, and Phala, and ideally it should work for all of them.

# TODO

- [ ] Moonriver
- [ ] Summery at the end
- [ ] ORML pallets
