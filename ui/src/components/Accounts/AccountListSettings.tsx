import classNames from 'classnames';
import { useCallback, useContext, useMemo, useState } from 'react';
import { AppContext } from '../../store';
import { SharedStyles } from '../../utils/styles';
import ModalBox from '../ModalBox';

const AccountListSettings = () => {
	const { actions } = useContext(AppContext);
	const { addAccount } = actions;
	const [name, setNameInput] = useState('');
	const [stash, setIdInput] = useState('');

	const disabled = useMemo(() => !(name.length > 1 && stash.length > 1), [name, stash]);

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

	return (
		<ModalBox title="Add New Account">
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
