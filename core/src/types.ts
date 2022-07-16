import BN from 'bn.js';
import * as currencyFormatter from 'currency-formatter';

/// Origin of an asset.
export interface AssetOrigin {
  /// The owner.
  account: string;
  /// The chain to which it belongs.
  chain: string;
  /// The source pallet from which this asset has been extracted.
  source: string;
}

interface IAsset {
  name: string;
  token_name: string;
  amount: BN;
  transferrable: boolean;
  price: number;
  decimals: BN;
  origin: AssetOrigin;
}

/// A value bearing asset, existing in some blockchain system.
export class Asset {
  /// The token name of this asset. Usually a 3-4 character ticker, e.g. BTC.
  token_name: string;
  /// Longer version of the name of this asset, e.g. Bitcoin.
  name: string;
  /// The amount of asset.
  amount: BN;
  /// The decimal points of this asset.
  decimals: BN;
  /// Indicates if this asset is transferrable or not.
  transferrable: boolean;
  /// Last known price of this asset.
  price: number;
  /// Origin details of the asset.
  origin: AssetOrigin;

  constructor(asset: IAsset) {
    this.name = asset.name;
    this.token_name = asset.token_name;
    this.amount = asset.amount;
    this.transferrable = asset.transferrable;
    this.amount = asset.amount;
    this.price = asset.price;
    this.decimals = asset.decimals;
    this.origin = asset.origin;
  }

  decimalAmount(): BN {
    return this.amount.div(new BN(10).pow(this.decimals));
  }

  perThousandsFraction(): BN {
    return this.amount.div(new BN(10).pow(this.decimals.sub(new BN(3)))).mod(new BN(1000));
  }

  euroValue(): number {
    if (this.price === 0) {
      return 0;
    }
    const d = new BN(1000);
    const scaledValue = this.amount.mul(d).div(new BN(10).pow(this.decimals)).toNumber();
    return (scaledValue * this.price) / 1000;
  }

  format_amount(): string {
    const formatNumber = (x: BN) => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const token_amount = `${formatNumber(this.decimalAmount())}.${this.perThousandsFraction()
      .toString()
      .padStart(3, '0')}`;
    const eur_amount = this.euroValue();
    return `${token_amount} - ${currencyFormatter.format(eur_amount, { locale: 'nl-NL' })}`;
  }

  numeric_amount(): number {
    return parseFloat(`${this.decimalAmount()}.${this.perThousandsFraction().toString()}`);
  }

  stringify(): string {
    return `[${this.transferrable ? '🍺' : '🔐'}][${this.token_name}] ${
      this.name
    }: ${this.format_amount()}`;
  }
}

/// An asset and its ratio in a summary.
///
/// Needless to say, this is only meaningful in the context of an existing `Summary` object.
interface AssetAndRatio {
  /// The asset.
  asset: Asset;
  /// Its ratio in a given `Summary`.
  ratio: number;
}

/// The summary of a collection of assets.
///
/// Any collection of assets can be made into a summary, regardless of their source.
export class Summary {
  /// A mapping from the final asset name (i.e. token name) to that asset, combined with a number
  /// representing the
  assets: Map<string, AssetAndRatio>;
  /// The total euro value of this summary.
  total_eur_value: number;

  constructor(input_assets: Asset[]) {
    const assets: Map<string, AssetAndRatio> = new Map();
    for (const asset of input_assets) {
      if (!asset.amount.isZero()) {
        if (assets.has(asset.token_name)) {
          const { asset: cumulative, ratio } = assets.get(asset.token_name) || {
            asset: asset,
            ratio: 0
          };
          cumulative.amount = cumulative.amount.add(asset.amount);
          assets.set(asset.token_name, { asset: cumulative, ratio: 0 });
        } else {
          const copy: Asset = new Asset({ ...asset });
          assets.set(asset.token_name, { asset: copy, ratio: 0 });
        }
      }
    }

    // compute sum of EUR-value in the entire map, and assign new ratio to each.
    let total_eur_value = 0;
    assets.forEach(({ asset }) => (total_eur_value = total_eur_value + asset.euroValue()));

    for (const asset_id of assets.keys()) {
      // just a wacky way to tell TS that the map def. contains `asset_id`:
      // https://typescript-eslint.io/rules/no-non-null-assertion/
      // https://linguinecode.com/post/how-to-solve-typescript-possibly-undefined-value
      const { asset, ratio: _prev_raio } = assets.get(asset_id)!;
      const new_ratio = asset.euroValue() / total_eur_value;
      assets.set(asset_id, { asset, ratio: new_ratio });
    }

    this.total_eur_value = total_eur_value;
    this.assets = assets;
  }

  stringify(): string {
    let ret = '';
    const sorted = Array.from(this.assets.entries())
      .sort((a, b) => a[1].ratio - b[1].ratio)
      .reverse();
    for (const [_, { asset: sum_asset, ratio }] of sorted) {
      ret += `🎁 sum of ${sum_asset.token_name}: ${sum_asset.format_amount()}, ${(
        ratio * 100
      ).toFixed(2)}% of total [unit price = ${sum_asset.price}].\n`;
    }
    ret += `💰 total EUR value: ${currencyFormatter.format(this.total_eur_value, {
      locale: 'nl-NL'
    })}\n`;
    return ret;
  }
}
