import React, { useState } from 'react'

const Electronicsoffice = () => {
    const [selectedStore, setSelectedStore] = useState(null);

    const stores = [
        { id: 1, name: "Fix It Celltronics", image: "https://web.archive.org/web/20170127140735im_/https://clubsave.ky/media/Fix_It_Celltronics_240new.png", description: "Whether your looking to purchase a new electronic device or need a quick fix by our qualified in store technicians , our company is your one stop shop. A wide variety of electronics are in stock at all times, we sell new and used devices at incredible prices!", phone: "517-1710 / 923-2119", email: "fixitcelltronics@gmail.com" },
        { id: 2, name: "Compucay", image: "https://web.archive.org/web/20170127212259im_/https://clubsave.ky/media/CompuCay240new.png", description: "CompuCay is your source for cutting edge technology. We provide business management services and IT solutions for any small office, home office, store, resturant or large corporate enterprise. Whether you're in need of greater efficiency, ongoing or temporary support, or just want to maximize existing applications, CompuCay has the capabilities to get the job done.", phone: "327-5587", email: "sales@compucay.ky" },
        { id: 3, name: "FLOW", image: "https://web.archive.org/web/20170127122247im_/https://clubsave.ky/media/Flow_negative_gradient_version_blue_copy_240x2402_SEQIlye.png", description: "Hello, we're FLOW, the Caribbean's leading communications company. We're a fresh approach to telecommunications for the Caribbean. And we stand on a single principle.", phone: "9497800", email: "orders@officesupply.ky" },
        { id: 4, name: "Cayphone Electronics", image: "https://web.archive.org/web/20170128190655im_/https://clubsave.ky/media/Cayphone240new.jpg", description: "Your one stop electronic store... We sell various brands of tablets to cell phones from Apple and Samsung to Blu, Sky, and other Android devices at competitive prices. Also offering a wide selection of accessories for your cell phones, tablets, gaming consoles and other electronic devices.", phone: "928-1859", email: "cayphone@gmail.com" },
        { id: 5, name: "Lee's Office Products", image: "https://web.archive.org/web/20170128171224im_/https://clubsave.ky/media/LEES_LOGO_NEW240.jpg", description: "The one-stop shop for all your office supplies and printing needs. Offering a wide range of office, school supplies. Special orders are also available per your request. We also provide printing services such as flyers, banners, rack cards, vehicle wraps and more!", phone: "949-2303", email: "sales_leesofficeproducts@candw.ky" }
    ];
    return (
        <div id="electronics" className="container mx-auto px-4 py-8 -mt-0">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Electronics & Office</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

export default Electronicsoffice