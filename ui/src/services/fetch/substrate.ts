// @ts-nocheck
import '@polkadot/api-augment/substrate';
import { ApiPromise } from "@polkadot/api";
import { Option } from "@polkadot/types";
import BN from "bn.js";
import { Asset, PerPallet } from "../../store/types";
import { priceOf } from "../../utils";

export async function fetch_vesting(api: ApiPromise, account: string, block_number: BN): Promise<PerPallet> {
	const accountData = await api.query.system.account(account);
	const vesting = (await api.query.vesting.vesting(account)).unwrapOrDefault();
	const totalBalance = accountData.data.free.add(accountData.data.reserved);
	if (vesting.length === 1) {
		const schedule = vesting[0];
		totalBalance.sub(schedule.locked);
		const madeFree = (block_number.sub(schedule.startingBlock)).mul(schedule.perBlock);
		schedule.locked.sub(madeFree);
	}

	return new PerPallet({ assets: [], name: "vesting" })
}

export async function fetch_system(api: ApiPromise, account: string, token_name: string, price: number): Promise<PerPallet> {
	const accountData = await api.query.system.account(account);
	const decimals = new BN(api.registry.chainDecimals[0]);
	const assets: Asset[] = [
		new Asset({ name: `free`, token_name, price, transferrable: true, amount: accountData.data.free, decimals }),
		new Asset({ name: `reserved`, token_name, price, transferrable: false, amount: accountData.data.reserved, decimals })
	];
	return new PerPallet({ assets, name: "system" })
}

export async function fetch_crowdloan(api: ApiPromise, account: string, token_name: string, price: number): Promise<PerPallet> {
	const accountHex = api.createType('AccountId', account).toHex();
	const decimals = new BN(api.registry.chainDecimals[0]);
	// @ts-ignore
	const allParaIds: ParaId[] = (await api.query.paras.paraLifecycles.entries()).map(([key, _]) => key.args[0]);
	const assets: Asset[] = [];
	const fetchParaIdPromise = allParaIds.map(async (id) => {
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
					}
				);
				assets.push(asset)
			}
		}
	});

	await Promise.all(fetchParaIdPromise);

	return new PerPallet({ assets, name: "crowdloan" })
}

export async function fetch_assets(api: ApiPromise, account: string): Promise<PerPallet> {
	const assets: Asset[] = [];
	const allAssetIds = (await api.query.assets.asset.entries()).map((a) => a[0].args[0]);
	const fetchAssetsPromise = allAssetIds.map(async (assetId) => {
		// @ts-ignore
		const assetAccount: Option<PalletAssetsAssetAccount> = await api.query.assets.account(assetId, account);
		if (assetAccount.isSome && !assetAccount.unwrap().balance.isZero()) {
			const meta = await api.query.assets.metadata(assetId);
			 // @ts-ignore
			const decimals = new BN(meta.decimals);
			 // @ts-ignore
			const name = (meta.symbol.toHuman() || "").toString();
			const price = await priceOf(name);
			assets.push(new Asset({ name, price, token_name: name, transferrable: Boolean(assetAccount.unwrap().isFrozen), amount: assetAccount.unwrap().balance, decimals, }))
		}
	});

	await Promise.all(fetchAssetsPromise);


	return new PerPallet({ assets, name: "assets" })
}
