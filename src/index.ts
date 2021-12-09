import { ApiPromise, WsProvider } from "@polkadot/api";
import { ParaId } from "@polkadot/types/interfaces"
import { BN } from "@polkadot/util";
import { strict as assert } from "assert/strict";
import axios from "axios";
import * as currencyFormatter from "currency-formatter";
import { readFileSync } from "fs";

interface PerAccount {
	account_name: string,
	token_name: string,
	price: string,
	in_account: string,
	in_account_eur: string,
	vested_amount: string,
	vested_amount_eur: string,
	crowdloan_amount: string,
	crowdloan_amount_eur: string,
	total_amount: string,
	total_amount_eur: string,
	assets: string[]
}

const SUBSTRATE_BASED_CHAINS = JSON.parse(readFileSync('accounts.json').toString())

function balance(api: ApiPromise, balance: BN): string {
	return api.createType('Balance', balance).toHuman().toString()
}

async function priceOf(token: string): Promise<BN> {
	try {
		const data = await axios.get(`https://api.coingecko.com/api/v3/coins/${token}`);
		const price = data.data['market_data']['current_price']['eur'];
		return new BN(price * 100)
	} catch {
		console.log(`⛔️ failed to get the price of ${token}`)
		return new BN(0)
	}
}

function valueOf(api: ApiPromise, amount: BN, priceCent: BN): number {
	const decimals = (new BN(10)).pow(new BN(api.registry.chainDecimals[0]))
	return amount.mul(priceCent.div(new BN(100))).div(decimals).toNumber()
}

function valueOfWithDecimals(api: ApiPromise, amount: BN, priceCent: BN, decimals: BN): number {
	return amount.mul(priceCent.div(new BN(100))).div(decimals).toNumber()
}

function formatEUR(x: number): string {
	return currencyFormatter.format(x, { locale: "nl-NL" })
}

async function main() {
	for (const uri in SUBSTRATE_BASED_CHAINS) {
		// @ts-ignore
		const { chain, stashes, overwrite_currency_name }: { chain: string, overwrite_currency_name?: string, stashes: [string, string] } = SUBSTRATE_BASED_CHAINS[uri];
		const provider = new WsProvider(uri);
		const api = await ApiPromise.create({ provider });
		const token_name = overwrite_currency_name ? overwrite_currency_name : chain.toLowerCase();
		const priceCent = await priceOf(token_name);
		const number = (await api.rpc.chain.getBlock()).block.header.number.toBn();
		console.log(`✅ Connected to node: ${uri} / chain ${chain} / tokens ${api.registry.chainTokens} / at #${number}[ss58: ${api.registry.chainSS58}][current price :${priceCent} cents]`);


		const perAccounts = [];
		for (const [account, name] of stashes) {
			// account balance.
			const accountData = await api.query.system.account(account);
			const amount = new BN(accountData.data.free.add(accountData.data.reserved));
			// console.log(`💸 Balance of ${name} ${balance(api, amount)}`)

			// vesting stuff
			let vested = new BN(0);
			if (api.query.vesting && api.query.vesting.vesting) {
				const vesting = (await api.query.vesting.vesting(account)).unwrapOrDefault();
				const totalBalance = accountData.data.free.add(accountData.data.reserved);
				assert.ok(vesting.length <= 1);
				if (vesting.length === 1) {
					const schedule = vesting[0];
					const nonVested = totalBalance.sub(schedule.locked);
					const madeFree = (number.sub(schedule.startingBlock)).mul(schedule.perBlock);
					const leftVesting = schedule.locked.sub(madeFree);
					// assert.ok(nonVested.add(madeFree).eq(leftVesting));

					// console.log(`🔐 of which ${balance(api, nonVested.add(madeFree))} is free, ${balance(api, leftVesting)} is still locked`)
					vested = leftVesting;
				}
			}

			// crowdloan stuff
			let crowdloan = new BN(0)
			if (api.query.crowdloan) {
				const accountHex = api.createType('AccountId', account).toHex();
				// @ts-ignore
				const allParaIds: ParaId[] = (await api.query.paras.paraLifecycles.entries()).map(([key, _]) => key.args[0]);
				for (const id of allParaIds) {
					const contribution = await api.derive.crowdloan.ownContributions(id, [accountHex])
					if (contribution) {
						const amount: BN = contribution[accountHex];
						if (amount && amount.gt(new BN(0))) {
							// console.log(`💰 found a contribution from ${account} to ${id} by ${balance(api, amount)}`);
							crowdloan = crowdloan.add(amount);
						}
					}
				}
			}

			// assets
			const assets: string[] = [];
			if (api.query.assets) {
				const allAssetIds = (await api.query.assets.asset.entries()).map((a) => a[0].args[0]);
				for (const assetId of allAssetIds) {
					const assetAccount = (await api.query.assets.account(assetId, account));
					if (!assetAccount.balance.isZero()) {
						const meta = await api.query.assets.metadata(assetId);
						const decimals = new BN(meta.decimals);
						const assetName = (meta.symbol.toHuman() || "").toString().toLowerCase() ;
						const assetPriceCent = await priceOf(assetName);
						const value = valueOfWithDecimals(api, assetAccount.balance, assetPriceCent, decimals);
						assets.push(`${assetName}, ${assetAccount.balance.toHuman()}, ${formatEUR(value)}`)
					}
				}
			}

			const perAccount: PerAccount = {
				account_name: name,
				token_name,
				price: (priceCent.toNumber() / 100).toFixed(2),
				in_account: balance(api, amount),
				in_account_eur: formatEUR(valueOf(api, amount, priceCent)),
				crowdloan_amount: balance(api, crowdloan),
				crowdloan_amount_eur: formatEUR(valueOf(api, crowdloan, priceCent)),
				vested_amount: balance(api, vested),
				vested_amount_eur: formatEUR(valueOf(api, vested, priceCent)),
				total_amount: balance(api, amount.add(crowdloan)),
				total_amount_eur: formatEUR(valueOf(api, amount.add(crowdloan), priceCent)),
				assets,
			}
			perAccounts.push(perAccount);
		}

		console.table(perAccounts)
		const assetData = perAccounts.map((x) => x.assets).filter((x) => x.length);
		if (assetData.length) {
			console.table(assetData)
		}
	}
}

main().catch(console.error).finally(() => process.exit());

