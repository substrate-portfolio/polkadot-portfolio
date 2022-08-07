import classNames from 'classnames';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppContext } from '../../store';
import { SharedStyles } from '../../utils/styles';
import ModalBox from '../ModalBox';
import { isAddress } from 'polkadot-portfolio-core';
import {
	web3Accounts,
	web3Enable,
	web3FromAddress,
	web3ListRpcProviders,
	web3UseRpcProvider
} from '@polkadot/extension-dapp';
import { addSyntheticLeadingComment } from 'typescript';

const AccountListSettings = () => {
	const { actions } = useContext(AppContext);
	const { addAccount } = actions;
	const [name, setNameInput] = useState('');
	const [stash, setIdInput] = useState('');

	const [injectedAccounts, setInjectedAccounts] = useState<{ address: string; name: string }[]>([]);

	const updatedInjectedAccounts = async () => {
		const allInjected = await web3Enable('portfolio');
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
		// You need to restrict it at some point
		// This is just dummy code and should be replaced by actual
		if (injectedAccounts.length === 0) {
			updatedInjectedAccounts();
		}
	}, []);

	return (
		<ModalBox title="Add New Account">
			<h2> Extension Account </h2>
			<ul>
				{injectedAccounts.map(({ address, name }) => (
					<li key={address}>
						{address} / {name} / <button> Add </button>
					</li>
				))}
			</ul>
			<hr />
			<h2> Custom Account </h2>
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
