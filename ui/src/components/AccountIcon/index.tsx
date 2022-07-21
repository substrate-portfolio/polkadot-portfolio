import Identicon from '@polkadot/react-identicon';

interface AccountIconProps {
	address: string;
	size?: number;
	theme?: NetworkThemes;
}

export enum NetworkThemes {
	PolkaDot = 'polkadot',
	Substrate = 'substrate',
	BeachBall = 'beachball',
	JDentIcon = 'jdenticon'
}

const AccountIcon: React.FC<AccountIconProps> = (props: AccountIconProps) => {
	const { address, size, theme } = props;
	const DefaultSize = 24;
	const DefaultTheme = NetworkThemes.PolkaDot;
	return <Identicon value={address} size={size ?? DefaultSize} theme={theme ?? DefaultTheme} />;
};

export default AccountIcon;
