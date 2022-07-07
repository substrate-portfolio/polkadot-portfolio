// @ts-nocheck
import '@polkadot/api-augment/substrate';
import { ApiPromise } from "@polkadot/api";
import { Option } from "@polkadot/types";
import BN from "bn.js";
import { Asset } from "../types";
import { priceOf } from "../utils";

export async function fetch_system(api: ApiPromise, account: string, chain: string): Promise<Asset[]> {
	const token_name = api.registry.chainTokens[0];
	const price = await priceOf(token_name);
	const accountData = await api.query.system.account(account);
	const decimals = new BN(api.registry.chainDecimals[0]);
	const assets: Asset[] = [
		new Asset({
			name: `free_${token_name}`,
			token_name,
			price,
			transferrable: true,
			amount: accountData.data.free || new BN(0),
			decimals,
			origin: { account, chain, source: "system pallet" }
		}),
		new Asset({
			name: `reserved_${token_name}`,
			token_name,
			price,
			transferrable: false,
			amount: accountData.data.reserved || new BN(0),
			decimals,
			origin: { account, chain, source: "system pallet" }
		})
	];
	return assets
}

export async function fetch_crowdloan(api: ApiPromise, account: string, chain: string): Promise<Asset[]> {
	const token_name = api.registry.chainTokens[0];
	const price = await priceOf(token_name);
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
						origin: { account, chain, source: "crowdloan pallet" }
					}
				);
				assets.push(asset)
			}
		}
	});

	await Promise.all(fetchParaIdPromise);

	return assets
}

export async function fetch_assets(api: ApiPromise, account: string, chain: string): Promise<Asset[]> {
	const assets: Asset[] = [];
	const allAssetIds = (await api.query.assets.asset.entries()).map((a) => a[0].args[0]);
	const fetchAssetsPromise = allAssetIds.map(async (assetId) => {
		const assetAccount: Option<PalletAssetsAssetAccount> = await api.query.assets.account(assetId, account);
		if (assetAccount.isSome && !assetAccount.unwrap().balance.isZero()) {
			const meta = await api.query.assets.metadata(assetId);
			const decimals = new BN(meta.decimals);
			const name = (meta.symbol.toHuman() || "").toString();
			const price = await priceOf(name);
			assets.push(new Asset({
				name,
				price,
				token_name: name,
				transferrable: Boolean(assetAccount.unwrap().isFrozen),
				amount: assetAccount.unwrap().balance,
				decimals,
				origin: { account, chain, source: "assets pallet" }
			}))
		}
	});
	await Promise.all(fetchAssetsPromise);

	return assets
}
