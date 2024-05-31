import { useState } from 'react';
import { BlankCardSvg } from '../common/BlankCardSvg';
import { OpenBlankCardSvg } from '../common/OpenBlankCardSvg';
import CardCanvas from './CardCanvas';

const LandingHero = () => {
    const [isCardOpen, setIsCardOpen] = useState(false);

    const toggleCard = () => {
        setIsCardOpen(!isCardOpen);
    };

    return (
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 mt-16 flex flex-col items-center">
            <h1 className="block text-3xl font-bold text-gray-800 sm:text-5xl md:text-5xl lg:text-6xl dark:text-white">Build custom cards</h1>
            <div className="lg:col-span-3 mt-10 lg:mt-10 relative overflow-hidden">
                {/* <div className='relative z-0' style={{ width: 600, height: 600 }}> */}
                    <CardCanvas width={600} height={600} cornerRadius={20} backgroundColor='white'/>
                {/* </div> */}
                <div className='absolute inset-0 flex justify-center items-center' style={{ padding: 0, margin: 0 }} onClick={toggleCard}>
                    {/* logic for displaying open or closed card */}
                    {/* {isCardOpen ? <OpenBlankCardSvg style={{ width: '90%', height: '90%' }} /> : <BlankCardSvg style={{ width: '90%', height: '90%' }} />} */}
                    <OpenBlankCardSvg style={{ width: '95%', height: '95%' }} />
                    {/* <BlankCardSvg style={{ width: '90%', height: '90%' }} /> */}
                </div>
            </div>
            <div className="lg:col-span-3 mt-10 mb-10 lg:mt-10 relative overflow-hidden">
                {/* <div className='relative z-0' style={{ width: 600, height: 600 }}> */}
                    <CardCanvas width={600} height={600} cornerRadius={20} backgroundColor='white'/>
                {/* </div> */}
                <div className='absolute inset-0 flex justify-center items-center' style={{ padding: 0, margin: 0 }} onClick={toggleCard}>
                    {/* logic for displaying open or closed card */}
                    {/* {isCardOpen ? <OpenBlankCardSvg style={{ width: '90%', height: '90%' }} /> : <BlankCardSvg style={{ width: '90%', height: '90%' }} />} */}
                    <BlankCardSvg style={{ width: '90%', height: '90%' }} />
                </div>
            </div>
        </div>
    )
};

export default LandingHero;