import React, { useState } from 'react'

const Retail = () => {
    const [selectedStore, setSelectedStore] = useState(null);

    const stores = [
        { id: 1, name: "Paradise Vapors", image: "https://web.archive.org/web/20170127203441im_/https://clubsave.ky/media/paradisevaporsnew_240x240_hGGA5mq.jpg", description: "Tired of smoking cigarettes but find it hard to kick that nicotine craving? Come and see us as we stock a wide variety of electronic cigarettes. We also carry sub ohm box mods for huge clouds.", phone: "938-8273", email: "Info@paradisevapors.com.ky" },
        { id: 2, name: "JJSK Collection", image: "https://web.archive.org/web/20161021122644im_/https://clubsave.ky/media/JJSK_Collection_Logo_on_White-green_240new.jpg", description: "TOYS, GIFTS & MORE ...... At our store you will find affordable toys, clothing, jewelry, fireworks and much more.", phone: "949-7745", email: "sales@jjskcollection.com" },
        { id: 3, name: "H2Only", image: "https://web.archive.org/web/20161021122644im_/https://clubsave.ky/media/H2only240x2402.png", description: "The Purest Drinking Water on Earth. H2Only is pure water: That's 100% ultra-pure H2O, and 0% everything else.", phone: "9462004", email: "info@h2only.ky" },
        { id: 4, name: "S&D Enterprise", image: "https://web.archive.org/web/20161021122644im_/https://clubsave.ky/media/S__D_ENTERPRISE_LOGO240X2402.jpg", description: "Offering organic skin and hair products for all ages, promoting healthy living and lifestyle.", phone: "9393272 / 3242434", email: "sdenterprise36@gmail.com" },
        { id: 5, name: "Animal Empire & Spa", image: "https://web.archive.org/web/20161021122644im_/https://clubsave.ky/media/pet_barn240_vI2u77x.jpg", description: "A pet store & day care spa with a passion for providing the most nutritional and well balanced Brand Name Dog & Cat food!", phone: "322-8811", email: "animal.empire2016@gmail.com" },
        { id: 6, name: "FLOW", image: "https://web.archive.org/web/20161021122644im_/https://clubsave.ky/media/FLOW240x240.jpg", description: "Hello, we're FLOW, the Caribbean's leading communications company. We're a fresh approach to telecommunications for the Caribbean.", phone: "9497800", email: "flow@.ky" },
        { id: 7, name: "Christian Enlightenment Center", image: "https://web.archive.org/web/20161021122644im_/https://clubsave.ky/media/christian_enlightenment_logo_240x2402.jpg", description: "We are the largest store on island providing Bibles, Christian Books, Inspirational Gifts, Bible Cases.", phone: "9451252", email: "cecenter@candw.ky" },
        { id: 8, name: "The Partyville", image: "https://web.archive.org/web/20161021122644im_/https://clubsave.ky/media/Partyville-Logo240new.jpg", description: "The Partyville offers event planning services for weddings, baby showers, birthday parties, corporate events, graduation parties, anniversary parties and more.", phone: "943-8455", email: "partyvilleltd@gmail.com" },
        { id: 9, name: "Caribbean Jewellers", image: "https://web.archive.org/web/20161021122644im_/https://clubsave.ky/media/caribbean_jewellers240new.png", description: "Beautiful Gold pieces in stock always... Gold/Silver rings, coins, earrings, necklaces etc 3 Month layaway plans available!", phone: "945-7464", email: "Caribbeanjewellersltd@yahoo.com" },
        { id: 10, name: "Party Source", image: "https://web.archive.org/web/20161021122644im_/https://clubsave.ky/media/party_source240new.jpg", description: "Whether you're planning a children's birthday party, a wedding, a baby shower or just want to throw a party we are the source for all of your needs.", phone: "947-2789/916-2789", email: "party.source@hotmail.com" },
        { id: 11, name: "Winners Circle Sports", image: "https://web.archive.org/web/20161021122644im_/https://clubsave.ky/media/WINNER_CIRCLE_240new_I91yM71.jpg", description: "We are focused on bringing you the best brands & quality shoes, clothes, sporting goods at affordable prices.", phone: "949-0068", email: "winnerscircle@candw.ky" },
        { id: 12, name: "Jacques Scott Wines & Spirits", image: "https://web.archive.org/web/20161021122644im_/https://clubsave.ky/media/Jacques_Scott_Wines__Spirits_SQUARE_240X240new.jpg", description: "Where you will find the best brands of Wine, Beer and Spirits at the best prices.", phone: "949-0277", email: "jacques@sprits.ky" },
        { id: 13, name: "Prodigy Jewelry", image: "https://web.archive.org/web/20161021122644im_/https://clubsave.ky/media/Prodigy_Jewelers_JPG_2402_LpWgTBq.jpg", description: "Over 25 Years Experience in Jewelry Design & Repair! We have an expert custom jewelry design centre.", phone: "749-7647 / 929-4587", email: "prodigyjewelers@msn.com" },
        { id: 14, name: "The NO.1 Shoe Shop", image: "https://web.archive.org/web/20161021122644im_/https://clubsave.ky/media/The_No.1_Shoe_shop_240new_0u8rrKF.jpg", description: "STYLE & FASHION SHOES FOR EVERY OCCASION... We are a family owned & operated company that specializes in athletic, casual and dress shoe retailing and repair.", phone: "949-5595", email: "No1shoes@gmail.ky" }
    ];
    return (
        <div id="retail" className="container mx-auto px-4 py-8 -mt-0">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Retail</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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

export default Retail