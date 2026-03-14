import React, { useState } from 'react'

const FoodBeverage = () => {
    const [selectedVenue, setSelectedVenue] = useState(null);

    const venues = [
        { id: 1, name: "Chicken Chicken", image: "https://web.archive.org/web/20170128162448im_/https://clubsave.ky/media/CHICKEN_Logo_240_rK9YWBw.jpg", description: "Chicken!Chicken! is all about healthy \"Caribbean Wood Roasted\" chicken served with \"Refreshingly Chilled\" and \"Delightfully Warm\" asides. We also serve homemade soups, fresh salads and healthy wraps.", phone: "945-2290", email: "chicken@chicken2.com" },
        { id: 2, name: "Island Grub", image: "https://web.archive.org/web/20170128045735im_/https://clubsave.ky/media/islandgrub_square240.png", description: "Island Grub is Cayman's Premier online food ordering and delivery service for residents and visitors in Grand Cayman, Cayman Islands. It is simple and easy to view menus, and order online for delivery from your favourite local places for breakfast, lunch or dinner.", phone: "926-4303", email: "info@islandgrub.ky" },
        { id: 3, name: "Southern Spice", image: "https://web.archive.org/web/20170127152121im_/https://clubsave.ky/media/Souhtern_Spice_240.jpg", description: "Our restaurant definitely means taste, flavor, affection, pleasure, delight, happiness, charm, sentiment, pathos, beauty and essence of Indian Cuisine. Whether you are a local or a visitor spending and couple of days in the Cayman Islands, this is one of the restaurants you don't want to miss.", phone: "345-949-5550", email: "eat@southernspicecayman.com" },
        { id: 4, name: "The Lunch Box", image: "https://web.archive.org/web/20161021122644im_/https://clubsave.ky/media/LunchBox_240X240new.png", description: "Quality is our recipe. Fresh, never frozen beef burgers, spicy chicken sandwiches, and Frostys.", phone: "+1 (345) 949-6655", email: "info@wendys.ky" },
        { id: 5, name: "Take out taxi", image: "https://web.archive.org/web/20161021122644im_/https://clubsave.ky/media/Take_Out_Taxi_1240.png", description: "Famous for its spicy New Orleans style fried chicken and biscuits.", phone: "+1 (345) 949-9999", email: "feedback@popeyes.ky" },
        { id: 6, name: "Haagen-Dazs", image: "https://web.archive.org/web/20170129015630im_/https://clubsave.ky/media/Haagen-daz_logo_240x240.png", description: "The leading brand in premium ice cream.... We offer a sumptuous selection of fine ice cream, sorbets and smoothies. Tempting flavours including dulce de leche and vanilla caramel brownie or enjoy a guilt-free treat like lemon, mango or raspberry sorbet.", phone: "9468061", email: "haagen@dazs.ky" },
        { id: 7, name: "XQ's", image: "https://web.archive.org/web/20170127211346im_/https://clubsave.ky/media/Xqs_logo_240x240_dks0c0p.png", description: "We are a modish, contemporary yet unpretentious restaurant and lounge serving casual food without compromising on quality. Exceptional wholesome dishes such as steak, snapper and burgers using nothing but the freshest ingredients and the best Pizza on the rock.", phone: "947-9770", email: "info@xqs.ky" },
        { id: 8, name: "Jacques Scott Wines & Spirits", image: "https://web.archive.org/web/20170127070103im_/https://clubsave.ky/media/Jacques_Scott_Wines__Spirits_SQUARE_240X240new.jpg", description: "Where you will find the best brands of Wine, Beer and Spirits at the best prices. In our stores you will find the finest French, Italian and American wines.", phone: "(345) 949-0277", email: "jacques@scott.com" },
        { id: 9, name: "Subway", image: "https://web.archive.org/web/20170128172223im_/https://clubsave.ky/media/Subway_logo240x240_VppS0zF.jpg", description: "Offering fresh, healthy options for your enjoyment! We can cater for every occasion, whether it's an office meeting, school lunch, party or sports event.", phone: "9453568", email: "subway@.com" },
        { id: 10, name: "Wendy's", image: "https://web.archive.org/web/20170129030905im_/https://clubsave.ky/media/Wendys_Final_Logo_2402.jpg", description: "It's way better than fast food. It's Wendy's! We are proud to offer Delicious Burgers, Natural Cut Fries w/ Sea Salt, Specialty Sandwiches, as well as Cayman Island 'Food For The Family' meals.", phone: "345-949.0616", email: "info@wendyscayman.com" },
        { id: 11, name: "Cimboco", image: "https://web.archive.org/web/20161225015126im_/https://clubsave.ky/media/CIMBOCO_240_ge9cCXb.jpg", description: "Cimboco Café features savory delicious pastas, fire roasted roti, pizzas, rustic sandwiches and homemade breads and desserts.", phone: "947-2782", email: "cimboco@.ky" },
        { id: 12, name: "Caribos 7 Sausage World", image: "https://web.archive.org/web/20170128065710im_/https://clubsave.ky/media/3d-glass_logo240x240_EbdYz4g.png", description: "Caribo's sausages is a well-known brand in the Cayman Islands and the company supplies many of the top hotels and restaurants.", phone: "945-7000", email: "info@caribos.com" },
        { id: 13, name: "Borden's Pizza", image: "https://web.archive.org/web/20170127045351im_/https://clubsave.ky/media/Bordens_Pizza240x240.jpg", description: "We are the Original Pizza Parlor of the Cayman Islands, family owned and operated since 1970. Serving fresh home made original recipes sure to delight your pallet.", phone: "+1 (345) 949-7633", email: "casanova@candw.ky" }
    ];

    return (
        <div id="food" className="container mx-auto px-4 py-8 -mt-0">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Food & Beverage</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {venues.map((venue) => (
                    <div key={venue.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
                        <div className="h-48 overflow-hidden">
                            <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
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

export default FoodBeverage