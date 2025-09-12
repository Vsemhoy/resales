import React, { useState, useEffect } from 'react';

import { Affix, Button, Card, Input } from 'antd';

import SmileOutlined from '@ant-design/icons/SmileOutlined';
import HomeFilled from '@ant-design/icons/HomeFilled';
import SettingTwoTone from '@ant-design/icons/SettingTwoTone';

import * as AntdIcons from '@ant-design/icons';
import { NavLink } from 'react-router-dom';

const isIconComponent = (icon) => {
	if (typeof icon === 'function') return false;
	if (typeof icon['render'] === 'function') {
		return true;
	}
	return false;
};

const AntdIconsPage = () => {
	const [iconToFind, setIconToFind] = useState('');
	const [selectedIcon, setSelectedIcon] = useState('SmileOutlined');
	const [filteredIcons, setFilteredIcons] = useState([]);
	const [type, setType] = useState('Outlined');
	const allIcons = Object.entries(AntdIcons).filter(([name, Icon]) => isIconComponent(Icon));

	useEffect(() => {
		if (iconToFind.trim()) {
			setFilteredIcons(
				allIcons.filter(([name]) => name.toLowerCase().includes(iconToFind.toLowerCase()))
			);
		} else {
			setFilteredIcons(allIcons);
		}
	}, [iconToFind]);

	const SelectedIconComponent = AntdIcons[selectedIcon];

	useEffect(() => {}, [filteredIcons]);

	return (
		<div style={{ background: 'white' }}>
			<h1>
				Ant Design Icons ({type}){' '}
				<NavLink to="/dev/icons/heroicons24">
					<AntdIcons.AmazonOutlined></AntdIcons.AmazonOutlined>
				</NavLink>
			</h1>
			<h3>
				<div className={'sa-flex-space sa-flex-gap'}>
					<div></div>
					<div>
						<NavLink to={'/dev/icons/customicons'}>
							<Button variant="link" color="primary" size="large">
								Custom
							</Button>
						</NavLink>
						<NavLink to={'/dev/icons/antdicons'}>
							<Button variant="link" color="danger" size="large">
								ANTD
							</Button>
						</NavLink>
						<NavLink to={'/dev/icons/heroicons24'}>
							<Button variant="link" color="primary" size="large">
								Hero24
							</Button>
						</NavLink>
					</div>
					<div></div>
				</div>
			</h3>
			<Affix offsetTop={0}>
				<div
					style={{
						background: '#770000bb',
						color: 'white',
						padding: '12px',
						fontFamily: 'monospace',
						fontSize: '1.3em',
						backdropFilter: 'blur(20px)',
					}}
				>{`import { ${selectedIcon} } from '@ant-design/icons';`}</div>
			</Affix>

			<Card>
				<br />
				<div
					style={{
						display: 'flex',
						gridGap: '12px',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<Button
						color="default"
						variant="outlined"
						onClick={() => {
							setType('Outlined');
						}}
					>
						Outlined
					</Button>
					<Button
						color="default"
						variant="solid"
						onClick={() => {
							setType('Filled');
						}}
					>
						Filled
					</Button>
					<Button
						color="default"
						variant={'dashed'}
						onClick={() => {
							setType('TwoTone');
						}}
					>
						TwoTone
					</Button>
				</div>
				<div>
					<br />
					<Input
						value={iconToFind}
						onChange={(e) => setIconToFind(e.target.value)}
						allowClear
						placeholder="Введите имя иконки для поиска"
						size="large"
						style={{ textAlign: 'center' }}
					/>
				</div>
			</Card>

			<div
				style={{
					display: 'flex',
					flexWrap: 'wrap',
					gap: 32,
					marginTop: 24,
					justifyContent: 'center',
				}}
			>
				{filteredIcons.length > 0 ? (
					filteredIcons
						.filter(([name, Icon]) => name.endsWith(type))
						.map(([name, Icon]) => (
							<div
								key={name}
								onClick={() => setSelectedIcon(name)}
								style={{
									width: 120,
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									cursor: 'pointer',
									color: name === selectedIcon ? '#1890ff' : '#333',
									userSelect: 'none',
									transition: 'color 0.3s',
								}}
								title={name}
							>
								<Icon style={{ fontSize: 48 }} />
								<div
									style={{
										marginTop: 8,
										fontSize: 'medium',
										textAlign: 'center',
										wordBreak: 'break-word',
									}}
								>
									{name}
								</div>
							</div>
						))
				) : (
					<div style={{ fontSize: 16, color: '#999' }}>Иконки не найдены</div>
				)}
			</div>

			<Affix offsetBottom={0}>
				<p
					style={{
						background: '#00709f94',
						padding: '6px',
						fontFamily: 'monospace',
						fontSize: 'xx-large',
						height: 48,
						marginTop: 2,
						backdropFilter: 'blur(20px)',
						textAlign: 'center',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					{SelectedIconComponent && <SelectedIconComponent size={36} />}
					<code style={{ marginLeft: 12 }}>{`<${selectedIcon} />`}</code>
				</p>
			</Affix>
		</div>
	);
};

export default AntdIconsPage;
