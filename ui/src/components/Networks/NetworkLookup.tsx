import { allChains, IChainEndpoint } from 'polkadot-portfolio-core';
import { useCallback, useEffect, useState } from 'react';
import { SharedStyles as styles } from '../../utils/styles';

const normalizeString = (input: string): string => input.toLowerCase();

const filterNetworks =
	(lookup: string) =>
	(item: IChainEndpoint): boolean => {
		const normalLookup = normalizeString(lookup);
		const isInName = normalizeString(item.name).includes(normalLookup);
		const isInEcosystem = normalizeString(item.ecosystem).includes(normalLookup);
		const isInEndpoints = Object.entries(item.endpoints).some(
			([key, endpoint]) =>
				normalizeString(key).includes(normalLookup) ||
				normalizeString(endpoint).includes(normalLookup)
		);

		return isInName || isInEcosystem || isInEndpoints;
	};

const NetworkLookup = () => {
	const [lookupInput, setLookupInput] = useState('');

	const handleLookupInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		const { value: lookup } = event.target;
		setLookupInput(lookup);
	}, []);

	useEffect(() => {
		const filteredNetworks = allChains.filter(filterNetworks(lookupInput));
		console.log(filteredNetworks);
	}, [lookupInput]);

	return (
		<div>
			<input
				value={lookupInput}
				name="networkInput"
				className={styles.input.default}
				placeholder="Network URL or Chain/Network Name"
				onChange={handleLookupInput}
			/>
		</div>
	);
};

export default NetworkLookup;
