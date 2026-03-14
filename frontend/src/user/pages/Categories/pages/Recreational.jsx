import React, { useState } from 'react'

const Recreational = () => {
    const [selectedStore, setSelectedStore] = useState(null);

    const stores = [
        { id: 1, name: "Cayman Paradise Tours", image: "https://web.archive.org/web/20170128114724im_/https://clubsave.ky/media/Cayman_Paradise_Tours_Logo_Color_Final240_final_sPshonp.jpg", description: "Enjoy a wonderful day on the water with us... We offer a wide range of Boat Tours, stopping at various locations for swimming and ocean life interactions.", phone: "926-7600 / 926-2371", email: "cayman@paradisetours.com" },
        { id: 2, name: "Kings Sports Centre", image: "https://web.archive.org/web/20170129034724im_/https://clubsave.ky/media/All_Logos_rgb-1kings_240x2403.jpg", description: "King's Sports Centre was established in 2002 and contains a bowling alley and lounge bar, two multipurpose rooms which are currently used for parties, aerobics, karate, and workshops. The facility also includes a 10,500 square foot multipurpose rink, used for roller skating, roller hockey, football, basketball, concerts, and shows.", phone: "9465464", email: "kings@candw.ky" },
        { id: 3, name: "G's & Gents", image: "https://web.archive.org/web/20161021122644im_/https://clubsave.ky/media/Nectar_logo_2240new.jpg", description: "Cayman's Exclusive Men's Outfitters. Get the finest in Men's wear for both G's and Gents.", phone: "929-1234", email: "gsandgents.cayman@gmail.com" },
        { id: 4, name: "Balloonimals345", image: "https://web.archive.org/web/20170127090201im_/https://clubsave.ky/media/Ballooninmals345_240x240.jpg", description: "Welcome to our company, believing in colorful fun for all ages and special occasions. We are artistic, friendly, creative & talented.", phone: "9177757 or 3233350", email: "balloonimals345@gmail.com" },
        { id: 5, name: "Lil Monkeys", image: "https://web.archive.org/web/20170127041443im_/https://clubsave.ky/media/Lil_Monkeys_240new.jpg", description: "Offering fun and activities for your kids, also catering for special events and birthday parties... Indoor Activities:Arcade Games, Party Rooms, Mini swing sets, Toddler Area, Children Playground, Slides and Ball pool, Mobile ride on toys, Kids mini shopping center with cart. Seating available in our cafeteria or by the indoor play area.", phone: "949-2580", email: "lilmonkeyscayman@gmail.com" },
        { id: 6, name: "Paradise Vapors", image: "https://web.archive.org/web/20170127203441im_/https://clubsave.ky/media/paradisevaporsnew_240x240_hGGA5mq.jpg", description: "Tired of smoking cigarettes but find it hard to kick that nicotine craving? Come and see us as we stock a wide variety of electronic cigarettes. We also carry sub ohm box mods for huge clouds.", phone: "938-8273", email: "Info@paradisevapors.com.ky" }
    ];
    return (
        <div id="fashion" className="container mx-auto px-4 py-8 -mt-0">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Recreational</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {stores.map((store) => (
                    <div key={store.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
                        <div className="h-48 overflow-hidden flex items-center justify-center bg-white p-2">
                            <img src={store.image} alt={store.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="p-6 flex flex-col flex-grow">
                            <h3 className="text-xl font-semibold mb-2 text-gray-900">{store.name}</h3>
                            <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">{store.description}</p>
                            <button onClick={() => setSelectedStore(store)} className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded hover:bg-blue-700 transition-colors mt-auto">View Details</button>
                        </div>
                    </div>
                ))}
            </div>

            {selectedStore && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedStore(null)}>
                    <div className="bg-white rounded-lg max-w-4xl w-full overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedStore(null)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10 bg-white rounded-full p-1">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <div className="flex flex-col md:flex-row">
                            <div className="w-full md:w-1/2 h-64 md:h-auto bg-gray-100 flex items-center justify-center p-4">
                                <img src={selectedStore.image} alt={selectedStore.name} className="max-w-full max-h-full object-contain" />
                            </div>
                            <div className="w-full md:w-1/2 p-8">
                                <h2 className="text-2xl font-bold mb-4 text-gray-900">{selectedStore.name}</h2>
                                <p className="text-gray-600 mb-6">{selectedStore.description}</p>
                                <div className="space-y-3 border-t pt-4">
                                    <div className="flex items-center text-gray-700"><span className="font-semibold w-20">Phone:</span><span>{selectedStore.phone}</span></div>
                                    <div className="flex items-center text-gray-700"><span className="font-semibold w-20">Email:</span><span>{selectedStore.email}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Recreational