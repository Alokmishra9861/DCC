import React, { useState } from 'react'

const HealthFitness = () => {
    const [selectedVenue, setSelectedVenue] = useState(null);

    const venues = [
        { id: 1, name: "Power House Gym-Kings Sport Centre", image: "https://web.archive.org/web/20170127191858im_/https://clubsave.ky/media/POWER_HOUSE240x240.png", description: "The Powerhouse Gym name and brand has been one of the top leaders in the fitness industry for over 35 years. With 300 licensees in 39 states, Powerhouse has continued to steadily gain global attention by expanding into 17 different countries worldwide.", phone: "946-5464", email: "kings@candw.ky" },
        { id: 2, name: "S&D Enterprise", image: "https://web.archive.org/web/20170128051130im_/https://clubsave.ky/media/S__D_ENTERPRISE_LOGO240X2402.jpg", description: "Offering organic skin and hair products for all ages, promoting healthy living and lifestyle. We stock the finest in skin and hair products such as Mielle Organics, Obia Naturals, Curls (Babies, Kids Adults) Natural clean soaps and so much more.", phone: "9393272 / 3242434", email: "sdenterprise36@gmail.com" },
        { id: 3, name: "Universal Fitness", image: "https://web.archive.org/web/20170128120957im_/https://clubsave.ky/media/universal_fitness_Logo240x240.png", description: "Everything You Need to Get Into the Best Shape! We are a one-stop facility that offers a holistic approach to wellness- from extensive exercise options to medical professionals we have it all in one club for you.", phone: "9475464", email: "membership@universalfitness.ky" },
        { id: 4, name: "Fitness Connection Ltd", image: "https://web.archive.org/web/20170128100826im_/https://clubsave.ky/media/Fitness_Connection_Logo_240x240_6b98Hmt.jpg", description: "We are a small, friendly and intimate fitness / aquatic facility that is located in the heart of South Sound, Grand Cayman. We are dedicated to supporting our clients in whatever their needs may be.", phone: "949-8485", email: "fitness@fitness.ky" }
    ];

    return (
        <div id="health" className="container mx-auto px-4 py-8 -mt-0">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Health & Fitness</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {venues.map((venue) => (
                    <div key={venue.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
                        <div className="h-48 overflow-hidden flex items-center justify-center bg-white p-2">
                            <img src={venue.image} alt={venue.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="p-6 flex flex-col flex-grow">
                            <h3 className="text-xl font-semibold mb-2 text-gray-900">{venue.name}</h3>
                            <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">{venue.description}</p>
                            <button onClick={() => setSelectedVenue(venue)} className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded hover:bg-blue-700 transition-colors mt-auto">View Details</button>
                        </div>
                    </div>
                ))}
            </div>

            {selectedVenue && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedVenue(null)}>
                    <div className="bg-white rounded-lg max-w-4xl w-full overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedVenue(null)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10 bg-white rounded-full p-1">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <div className="flex flex-col md:flex-row">
                            <div className="w-full md:w-1/2 h-64 md:h-auto bg-gray-100 flex items-center justify-center p-4">
                                <img src={selectedVenue.image} alt={selectedVenue.name} className="max-w-full max-h-full object-contain" />
                            </div>
                            <div className="w-full md:w-1/2 p-8">
                                <h2 className="text-2xl font-bold mb-4 text-gray-900">{selectedVenue.name}</h2>
                                <p className="text-gray-600 mb-6">{selectedVenue.description}</p>
                                <div className="space-y-3 border-t pt-4">
                                    <div className="flex items-center text-gray-700"><span className="font-semibold w-20">Phone:</span><span>{selectedVenue.phone}</span></div>
                                    <div className="flex items-center text-gray-700"><span className="font-semibold w-20">Email:</span><span>{selectedVenue.email}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default HealthFitness