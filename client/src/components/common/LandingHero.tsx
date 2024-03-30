import { BlankCardSvg } from '../common/BlankCardSvg';
// import { OpenBlankCard } from '../common/OpenBlankCardSvg';

const LandingHero = () => {
    return (
        // hero div
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 mt-16">
            {/* grid div */}
            <div className="grid lg:grid-cols-7 lg:gap-x-8 xl:gap-x-12 lg:items-center">
                {/* column div */}
                <div className="lg:col-span-3">
                    <h1 className="block text-3xl font-bold text-gray-800 sm:text-4xl md:text-5xl lg:text-6xl dark:text-white">Build custom cards</h1>
                    {/* questionable jsx, may want to look into this functionality of this block */}
                    <div className="mt-5 lg:mt-8 flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
                        <div className="w-full sm:w-auto">
                            <label htmlFor="hero-input" className="sr-only">Search</label>
                            <input type="text" id="hero-input" name="hero-input" className="py-3 px-4 block w-full xl:min-w-72 border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600" placeholder="Enter work email"></input>
                        </div>
                        <a className="w-full sm:w-auto py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600" href="#">
                            Login
                        </a>
                    </div>
                    {/* end of questionable block */}
                </div>
                {/* end of column div */}
                <div className="lg:col-span-3 mt-10 lg:mt-0">
                    <BlankCardSvg />
                </div>
            </div>
            {/* end of grid div */}
        </div>
        // end of hero div
    )
};

export default LandingHero;

