import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCallback, useState } from 'react';
import Modal from '../Modal';
import ModalBox from '../ModalBox';

const Styles = {
	wrapper: 'py-2 px-2 border-t-2 border-gray-100 mt-auto',
	button: 'text-gray-500 hover:text-gray-800 inline-block py-2 px-2 cursor-pointer',
	icon: 'mx-2',
	link: 'text-gray-500 hover:text-gray-800',
	paragraph: 'mb-2'
};

const About = () => {
	const [modalState, setModalState] = useState(false);
	const handleModalState = useCallback(
		(state: boolean) => () => {
			setModalState(state);
		},
		[]
	);
	return (
		<div className={Styles.wrapper}>
			<span className={Styles.button} onClick={handleModalState(true)}>
				<FontAwesomeIcon className={Styles.icon} icon={faInfoCircle} size="lg" />
				About Project
			</span>
			<Modal closeFn={handleModalState(false)} state={modalState}>
				<ModalBox title="About Project">
					<div className="flex flex-col flex-1 p-2">
						<p className={Styles.paragraph}>
							A tool to find all your bags of tokens im the highly complicated world of Polkadot
							Ecosystem.
						</p>
						<p className={Styles.paragraph}>
							This tool is completely open source. Feel free to contribute to the project in our{' '}
							<a
								className={Styles.link}
								target="_blank"
								rel="noreferrer"
								href="https://github.com/substrate-portfolio/polkadot-portfolio">
								Github
							</a>{' '}
							page.
						</p>
						<p className={Styles.paragraph}>
							Created by{' '}
							<a
								className={Styles.link}
								target="_blank"
								rel="noreferrer"
								href="https://github.com/kianenigma">
								Kian Paimani
							</a>{' '}
							&{' '}
							<a
								className={Styles.link}
								target="_blank"
								rel="noreferrer"
								href="https://github.com/HoseinEmrani">
								Hosein Emrani
							</a>{' '}
							.
						</p>
					</div>
				</ModalBox>
			</Modal>
		</div>
	);
};

export default About;
