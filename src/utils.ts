import axios from "axios";

export async function price_of(token: string): Promise<number> {
    try {
        const data = await axios.get(`https://api.coingecko.com/api/v3/coins/${token}`);
        const price = data.data['market_data']['current_price']['eur'];
        return price
    } catch {
        console.log(`⛔️ failed to get the price of ${token}`)
        return 0
    }
}
