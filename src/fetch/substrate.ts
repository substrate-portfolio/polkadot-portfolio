import { ApiPromise } from "@polkadot/api";
import BN from "bn.js";
import { Asset, PerPallet } from "../types";
import { strict as assert } from "assert/strict";
import { price_of } from "../utils";

export async function fetch_vesting(api: ApiPromise, account: string, block_number: BN): Promise<PerPallet> {
	const accountData = await api.query.system.account(account);
	const vesting = (await api.query.vesting.vesting(account)).unwrapOrDefault();
	const totalBalance = accountData.data.free.add(accountData.data.reserved);
	assert.ok(vesting.length <= 1);
	if (vesting.length === 1) {
		const schedule = vesting[0];
		const nonVested = totalBalance.sub(schedule.locked);
		const madeFree = (block_number.sub(schedule.startingBlock)).mul(schedule.perBlock);
		const leftVesting = schedule.locked.sub(madeFree);
	}

	return new PerPallet({ assets: [], name: "vesting" })
}

export async function fetch_system(api: ApiPromise, account: string, token_name: string, price: number): Promise<PerPallet> {
	const accountData = await api.query.system.account(account);
	const decimals = new BN(api.registry.chainDecimals[0]);
	const assets: Asset[] = [
		new Asset({ name: `free`, token_name, price, transferrable: true, amount: accountData.data.free, decimals, is_native: true }),
		new Asset({ name: `reserved`, token_name, price, transferrable: false, amount: accountData.data.reserved, decimals, is_native: true })
	];
	return new PerPallet({ assets, name: "system" })
}

export async function fetch_crowdloan(api: ApiPromise, account: string, token_name: string, price: number): Promise<PerPallet> {
	const accountHex = api.createType('AccountId', account).toHex();
	const decimals = new BN(api.registry.chainDecimals[0]);
	// @ts-ignore
	const allParaIds: ParaId[] = (await api.query.paras.paraLifecycles.entries()).map(([key, _]) => key.args[0]);
	const assets: Asset[] = [];
	for (const id of allParaIds) {
		const contribution = await api.derive.crowdloan.ownContributions(id, [accountHex])
		if (contribution[accountHex]) {
			const contribution_amount = contribution[accountHex];
			if (!contribution_amount.isZero()) {
				const asset = new Asset(
					{
						name: `crowdloan_${id}`,
						token_name,
						price,
						transferrable: false,
						amount: contribution_amount,
						decimals,
						is_native: true
					}
				);
				assets.push(asset)
			}
		}
	}

	return new PerPallet({ assets, name: "crowdloan" })
}

export async function fetch_assets(api: ApiPromise, account: string): Promise<PerPallet> {
	const assets: Asset[] = [];
	const allAssetIds = (await api.query.assets.asset.entries()).map((a) => a[0].args[0]);
	for (const assetId of allAssetIds) {
		// @ts-ignore
		const assetAccount: PalletAssetsAssetAccount = await api.query.assets.account(assetId, account);
		if (!assetAccount.balance.isZero()) {
			const meta = await api.query.assets.metadata(assetId);
			const decimals = new BN(meta.decimals);
			const name = (meta.symbol.toHuman() || "").toString().toLowerCase();
			const price = await price_of(name);
			assets.push(new Asset({ name, price, token_name: name, transferrable: Boolean(assetAccount.isFrozen), amount: assetAccount.balance, decimals, is_native: false }))
		}
	}

	return new PerPallet({ assets, name: "assets" })
}
