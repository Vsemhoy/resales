import React, { useEffect, useState } from 'react';
import * as HeroIcons from '@heroicons/react/16/solid';

const HeroIconsPage = () => {
	return (
		<div>
			<h1>Hello Wolf from HeroIconsPage</h1>
			<div
				style={{
					display: 'flex',
					flexWrap: 'wrap',
					gap: '32px',
				}}
			>
				{Object.entries(HeroIcons).map(([name, Icon]) => (
					<div
						key={name}
						style={{
							width: 120,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
						}}
					>
						<Icon style={{ width: 48, height: 48 }} />
						<div
							style={{
								marginTop: 8,
								fontSize: 12,
								textAlign: 'center',
								wordBreak: 'break-all',
								fontSize: 'medium',
							}}
						>
							{name}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default HeroIconsPage;
