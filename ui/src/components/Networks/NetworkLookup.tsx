import { allChains, Ecosystem, IChainEndpoint } from 'polkadot-portfolio-core';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SharedStyles as styles } from '../../utils/styles';

interface NetworkLookupProps {
	setNetworkInput: (input: string) => void;
}

interface NormalizedNetworkEndpoint {
	name: string;
	ecosystem: Ecosystem;
	endpointName: string;
	endpointAddress: string;
}

const normalizeString = (input: string): string => input.trim().toLowerCase();

const mapToEndpoints =
	(name: string, ecosystem: Ecosystem) =>
	([endpointName, endpointAddress]: [string, string]): NormalizedNetworkEndpoint =>
		({ name, ecosystem, endpointName, endpointAddress } as NormalizedNetworkEndpoint);

const normalizeChains = (chains: IChainEndpoint[]): NormalizedNetworkEndpoint[] => {
	return chains.reduce((prev, current) => {
		const endpoints = Object.entries(current.endpoints).map(
			mapToEndpoints(current.name, current.ecosystem)
		);
		return [...prev, ...endpoints];
	}, [] as NormalizedNetworkEndpoint[]);
};

const filterNetworks =
	(lookup: string) =>
	(item: NormalizedNetworkEndpoint): boolean => {
		const normalName = normalizeString(item.name);
		const normalEcoSystem = normalizeString(item.ecosystem);
		const normalEndpointName = normalizeString(item.endpointName);
		const normalAddress = normalizeString(item.endpointAddress);
		const lookups = lookup
			.split('/')
			.map(normalizeString)
			.filter((item) => item !== '');
		const isInName = lookups.some((normalLookup) => normalName.includes(normalLookup));
		const isInEcosystem = lookups.some((normalLookup) => normalEcoSystem.includes(normalLookup));
		const isInEndpointName = lookups.some((normalLookup) =>
			normalEndpointName.includes(normalLookup)
		);
		const isInEndpointAddress = lookups.some((normalLookup) =>
			normalAddress.includes(normalLookup)
		);

		return isInName || isInEcosystem || isInEndpointName || isInEndpointAddress;
	};

const NetworkLookup: React.FC<NetworkLookupProps> = ({ setNetworkInput }) => {
	const [lookupInput, setLookupInput] = useState('');
	const [networks, setNetworks] = useState<NormalizedNetworkEndpoint[]>([]);

	const [dropdownVisible, setDropdownVisibility] = useState(false);

	const handleLookupInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		const { value: lookup } = event.target;
		setDropdownVisibility(true);
		setLookupInput(lookup);
	}, []);

	const handleSelect = useCallback(
		(network: NormalizedNetworkEndpoint) => () => {
			const networkInput = `${network.ecosystem} / ${network.name} / ${network.endpointName}`;
			setLookupInput(networkInput);
			setNetworkInput(network.endpointAddress);
			setDropdownVisibility(false);
		},
		[]
	);

	const normalizedChains = useMemo(() => normalizeChains(allChains), []);

	useEffect(() => {
		const filteredNetworks = normalizedChains.filter(filterNetworks(lookupInput));
		setNetworks(filteredNetworks);
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
			{networks.length > 0 && dropdownVisible ? (
				<div className="relative">
					<div className="absolute top-0 left-0 w-full max-h-80 overflow-y-auto border border-slate-300 rounded-md bg-white">
						{networks.map((item, index) => (
							<div
								className="p-2 hover:bg-slate-100 cursor-pointer text-gray-200"
								key={`item__${index}`}
								onClick={handleSelect(item)}>
								<span className="pr-2 text-black">{item.ecosystem}</span>/
								<span className="px-2 text-black">{item.name}</span>/
								<span className="pl-2 text-black">{item.endpointName}</span>
							</div>
						))}
					</div>
				</div>
			) : null}
		</div>
	);
};

export default NetworkLookup;
