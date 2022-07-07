import { Asset, Summary, AssetOrigin } from "./types";
import { scrape } from './fetch';
import { currencyFormat, findDecimals, priceOf } from "./utils";

export {
  Asset, Summary, AssetOrigin, scrape, currencyFormat, findDecimals, priceOf
}

// Running the app:
import {main} from './app'
main().catch(console.error).finally(() => process.exit());

