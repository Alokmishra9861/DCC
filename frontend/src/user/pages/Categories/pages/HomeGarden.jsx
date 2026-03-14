import React, { useState } from 'react'

const HomeGarden = () => {
    const [selectedStore, setSelectedStore] = useState(null);

    const stores = [
        { id: 1, name: "Caribbean Property Management", image: "https://web.archive.org/web/20170127095300im_/https://clubsave.ky/media/Caribbean_Property_Management240.jpg", description: "We are here to give you the customer the highest standard of property management services at an affordable price. Our Services: - managing and maintaining residential and commercial properties - rentals - hurricane shutters of all types - gates and fencing installation - water heater - roofing - landscaping", phone: "9382024/9244149", email: "carib.propertymanagement@gmail.com" },
        { id: 2, name: "Cox Lumber Ltd.", image: "https://web.archive.org/web/20170127130006im_/https://clubsave.ky/media/Cox_Lumber_240x240_new.png", description: "Your lumber and more store… In business for over 65 years, Cox Lumber is your #1 destination in the Cayman Islands for building materials, doors, windows, paint, hardware and so much more.", phone: "949-0661", email: "info@coxlumberltd.com" },
        { id: 3, name: "Tomlinson Furniture Ltd", image: "https://web.archive.org/web/20170128232240im_/https://clubsave.ky/media/TF_logos_combined240.jpg", description: "Our furniture and accessories range from traditional to contemporary. We offer a wide selection of items from living room sets, dining room sets to bedroom sets including odd unusual pieces", phone: "949-5383", email: "info@tomlinsonfurniture.ky" },
        { id: 4, name: "Artic Air Conditoning Plumbing & Maintenance", image: "https://web.archive.org/web/20170128074321im_/https://clubsave.ky/media/Artic_Airconditioning.jpg", description: "Artic Air Conditioning Plumbing & Maintenance \"24 HRS SERVICE\" is a very friendly, reliable and professional company. Our aim is to keep our customers cool and comfortable with our high efficiency air conditioning units at very reasonable prices.", phone: "917-0350", email: "artic@airconditioning.com" },
        { id: 5, name: "International Lighting & Design", image: "https://web.archive.org/web/20170128125907im_/https://clubsave.ky/media/International_Lighting_OwT0Nz1.png", description: "International Lighting and Design is located in Ed's Plaza off North Sound Way. Products sold: Lighting Fixtures and Supplies Lamps and Lamp Shades and a whole lot more....", phone: "949-5141", email: "international@lighting.ky" },
        { id: 6, name: "H2Only", image: "https://web.archive.org/web/20170128180635im_/https://clubsave.ky/media/H2only240x2402.png", description: "The Purest Drinking Water on Earth. Water, the fluid of life and the shaper of the earth, is made from the simplest and most abundant element in the universe, hydrogen, joined to the vital gas, oxygen. H2Only is pure water: That's 100% ultra-pure H2O, and 0% everything else.", phone: "9462004", email: "info@h2only.ky" },
        { id: 7, name: "Total Window Fashions Ltd.", image: "https://web.archive.org/web/20170129062612im_/https://clubsave.ky/media/Total_Window_Fashions_24o2_CjaUPiV.jpg", description: "We have been operating since 2008, bringing you the best window fashions available in the Cayman Islands. Specializing in window treatment and decor.", phone: "325-9769 / 943-9769", email: "totalwindow@candw.ky" },
        { id: 8, name: "Squeaky Home Care Services", image: "https://web.archive.org/web/20170128161817im_/https://clubsave.ky/media/Squeaky_Home240x240_0USpwWC.jpg", description: "Leave the cleaning up to us! Providing you with trained, experienced professionals to offer you affordable cleaning services you can depend on.", phone: "9380613", email: "Squeakyhomecare@gmail.com" },
        { id: 9, name: "A. Quality Pest Control", image: "https://web.archive.org/web/20170128225528im_/https://clubsave.ky/media/AQ_Pest_control_Alt_page_01240.jpg", description: "Providing the best quality pest control with giving you the lowest prices on Island. All of our products are economy friendly.", phone: "9382024/9244149", email: "carib.propertymanagement@gmail.com" },
        { id: 10, name: "Perfect Mobile Pressure Washing & Car Wash", image: "https://web.archive.org/web/20170128144422im_/https://clubsave.ky/media/Perfect_Mobile_Pressure_Washing_logo_240X2402_7D2LSsC.jpg", description: "A local favorite for home goods, hardware, cleaning supplies, and everyday essentials at great prices.", phone: "922-3807 / 325-5205 / 922-7234", email: "perfect.designs@hotmail.com" }
    ];
    return (
        <div id="home" className="container mx-auto px-4 py-8 -mt-0">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Home & Garden</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {stores.map((store) => (
                    <div key={store.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
                        <div className="h-48 overflow-hidden">
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

export default HomeGarden