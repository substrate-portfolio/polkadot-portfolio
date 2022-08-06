import classNames from 'classnames';
import { useCallback } from 'react';
import { SharedStyles as styles } from '../../utils/styles';

interface ManualNetworkProps {
	networkInput: string;
	setNetworkInput: (wss: string) => void;
	validNetwork: boolean;
	setValidNetworkState: (state: boolean) => void;
}

const ManualNetwork: React.FC<ManualNetworkProps> = ({
	networkInput,
	setNetworkInput,
	validNetwork
}) => {
	const handleInput = useCallback(({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
		setNetworkInput(value);
	}, []);
	return (
		<div>
			<p className="pt-2 px-2 pb-4">Add your network WSS address.</p>
			<input
				value={networkInput}
				name="networkInput"
				className={classNames(styles.input.default, {
					[styles.input.invalid]: !validNetwork && networkInput.length
				})}
				placeholder="Network url"
				onChange={handleInput}
			/>
			{!validNetwork && networkInput.length ? (
				<p className="pt-2 px-2 pb-1 text-red-500">Please enter a valid web socket address.</p>
			) : null}
		</div>
	);
};

export default ManualNetwork;
