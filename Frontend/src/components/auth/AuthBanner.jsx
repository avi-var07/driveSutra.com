import React from 'react';

const AuthBanner = () => {
	return (
		<div className="p-6 text-center"> 
			<div className="text-6xl mb-4">🌿</div>
			<h3 className="text-2xl font-extrabold text-white mb-2">DriveSutra</h3>
			<p className="text-slate-300">Track eco-friendly trips, earn rewards, save the planet.</p>
			<ul className="mt-6 text-left text-slate-300 space-y-2">
				<li>• Reduce carbon footprint</li>
				<li>• Earn achievements</li>
				<li>• Compete on leaderboards</li>
			</ul>
		</div>
	);
};

export default AuthBanner;
