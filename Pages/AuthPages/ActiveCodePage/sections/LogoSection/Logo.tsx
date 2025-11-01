import React from 'react';

export const Logo = () => {
	return(
		<div className="flex flex-col items-center justify-center w-full max-w-[280px] xs:max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl gap-2 xs:gap-3 sm:gap-4">
			{/* logo */}
			<div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28">
				<img
				src="/acessts/Logo-picsart.png"
				alt="A2Z Logo"
				className="w-full h-full object-contain"
				/>
			</div>
    </div>
	)
	
};
export default React.memo(Logo);