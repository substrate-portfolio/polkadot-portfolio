import classNames from 'classnames';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppContext } from '../../store';
import { SharedStyles } from '../../utils/styles';
import ModalBox from '../ModalBox';
import { ApiPromise, isAddress } from 'polkadot-portfolio-core';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { add } from 'lodash';

const AccountListSettings = () => {
	const { state, actions } = useContext(AppContext);
	const { addAccount, getAccounts } = actions;

	const [name, setNameInput] = useState('');
	const [stash, setIdInput] = useState('');
	const [injectedAccounts, setInjectedAccounts] = useState<
		{ address: string; name: string; duplicate: boolean }[]
	>([]);

	const updatedInjectedAccounts = async () => {
		const _ = await web3Enable('portfolio');
		const alreadyAdded = getAccounts();
		const apis = Array.from(state.apiRegistry.values());
		const isDuplicate = (x: string, known: string[]): boolean => {
			if (apis.length > 0) {
				const api: ApiPromise = apis[0] as ApiPromise;
				const encoded = api.createType('AccountId', x).toU8a();
				return known.some((y) => api.createType('AccountId', y).eq(encoded));
			} else {
				return false;
			}
		};
		const allAccounts = (await web3Accounts()).map((acc) => {
			return {
				address: acc.address,
				name: acc.meta.name || 'unknown',
				duplicate: isDuplicate(acc.address, alreadyAdded)
			};
		});
		setInjectedAccounts(allAccounts);
	};

	const disabled = useMemo(() => {
		const lengthCondition = name.length > 1 && stash.length > 1;
		const addressCondition = stash.length > 0 ? isAddress(stash) : false;

		return !(lengthCondition && addressCondition);
	}, [name, stash]);

	const addAccountToList = useCallback(async () => {
		if (disabled) return;
		addAccount({
			name,
			id: stash
		});
		setNameInput('');
		setIdInput('');
	}, [addAccount, name, stash, disabled]);

	const addInjectedAccountToList = (name: string, id: string) => {
		addAccount({ name, id });
	};

	const handleStash = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setIdInput(event.target.value);
	}, []);

	const handleName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setNameInput(event.target.value);
	}, []);

	useEffect(() => {
		if (injectedAccounts.length === 0) {
			updatedInjectedAccounts();
		}
	}, []);

	return (
		<ModalBox title="Add New Account">
			<p className="text-lg font-bold"> Extension Account </p>
			<ul className="list-disc">
				{injectedAccounts.map(({ address, name, duplicate }) => (
					<li key={address}>
						{address} /{name} /
						<button
							type="button"
							disabled={duplicate}
							onClick={() => addInjectedAccountToList(name, address)}
							className="inline-block px-6 py-2.5 bg-green-500 text-white font-medium text-xs leading-tight rounded-full shadow-md hover:bg-green-600 hover:shadow-lg focus:bg-green-600 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-green-700 active:shadow-lg transition duration-150 ease-in-out">
							{duplicate ? 'already added!' : 'add'}
						</button>
					</li>
				))}
			</ul>
			<button
				disabled={disabled}
				className={classNames(SharedStyles.button.default, {
					[SharedStyles.button.disabled]: disabled
				})}
				onClick={addAccountToList}>
				Add Extension Accounts
			</button>
			<br className="border-100" />
			<p className="text-lg font-bold"> Custom Account </p>
			<div className="flex flex-col flex-1">
				<input
					value={name}
					className="border rounded-md border-gray-100 py-2 px-4 mb-2"
					placeholder="Account Name"
					onChange={handleName}
				/>
				<input
					value={stash}
					className="border rounded-md border-gray-100 py-2 px-4"
					placeholder="Account Id"
					onChange={handleStash}
				/>
			</div>
			<button
				disabled={disabled}
				className={classNames(SharedStyles.button.default, {
					[SharedStyles.button.disabled]: disabled
				})}
				onClick={addAccountToList}>
				Add Account
			</button>
		</ModalBox>
	);
};

export default AccountListSettings;
