import classNames from 'classnames';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppContext } from '../../store';
import { SharedStyles } from '../../utils/styles';
import ModalBox from '../ModalBox';
import { isAddress } from 'polkadot-portfolio-core';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';

const AccountListSettings = () => {
	const { actions } = useContext(AppContext);
	const { addAccount } = actions;
	const [name, setNameInput] = useState('');
	const [stash, setIdInput] = useState('');

	const [injectedAccounts, setInjectedAccounts] = useState<{ address: string; name: string }[]>([]);

	const updatedInjectedAccounts = async () => {
		const _ = await web3Enable('portfolio');
		const allAccounts = (await web3Accounts()).map((acc) => {
			return {
				address: acc.address,
				name: acc.meta.name || 'unknown'
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
			<button
				type="button"
				className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
				Select All
			</button>
			<ul className="list-disc">
				{injectedAccounts.map(({ address, name }) => (
					<li key={address}>
						<input type="checkbox" className="accent-green-500"></input>
						{address} / {name}
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
