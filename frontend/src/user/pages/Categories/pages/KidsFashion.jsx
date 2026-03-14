import React, { useState } from 'react'

const KidsFashion = () => {
    const [selectedActivity, setSelectedActivity] = useState(null);

    const kidsActivities = [
        { id: 1, name: "House of Stylez", image: "https://web.archive.org/web/20170127053721im_/https://clubsave.ky/media/house_of_styles_new240_5mopvTg.jpg", description: "Visit us today at Paddington Place on Godfrey Nixon Way. We sell all style clothing at amazing prices, from business to plain out party style clothing we have it in stock.....", phone: "945-0914", email: "info@turtle.ky" },
        { id: 2, name: "Nini's Fashion", image: "https://web.archive.org/web/20170127075737im_/https://clubsave.ky/media/ninisfashion_logo240new.jpg", description: "Nini's Fashion Colombian Style Clothing Store", phone: "926-7457/923-6950", email: "ninis@fashion.com" },
        { id: 3, name: "The NO.1 Shoe Shop", image: "https://web.archive.org/web/20170128053306im_/https://clubsave.ky/media/The_No.1_Shoe_shop_240new_0u8rrKF.jpg", description: "STYLE & SHOES FOR EVERY OCCASION... We are a family owned & operated company that specializes in athletic, casual and dress shoe retailing and repair.", phone: "949-5595", email: "N/A" },
        { id: 4, name: "Winners Circle Sports", image: "https://web.archive.org/web/20170128021235im_/https://clubsave.ky/media/WINNER_CIRCLE_240new_I91yM71.jpg", description: "We are focused on bringing you the best brands & quality shoes, clothes, sporting goods at affordable prices.Always presenting the top rated back to school footwear such as Nike Air Force One, Supra footwear, Converse footwear, Jordan footwear and more ....", phone: "949-0068", email: "winnerscircle@candw.ky" },
        { id: 5, name: "Balloonimals345", image: "https://web.archive.org/web/20170127090201im_/https://clubsave.ky/media/Ballooninmals345_240x240.jpg", description: "Welcome to our company, believing in colorful fun for all ages and special occasions.", phone: "9177757 or 3233350", email: "balloonimals345@gmail.com" },
        { id: 6, name: "JJSK Collection", image: "https://web.archive.org/web/20170127231407im_/https://clubsave.ky/media/JJSK_Collection_Logo_on_White-green_240new.jpg", description: "TOYS, GIFTS & MORE ...... At our store you will find affordable toys, clothing, jewelry, fireworks and much more. We hope you stop by and check us out. Our friendly staff would love to meet you.", phone: "949-7745", email: "sales@jjskcollection.com" },
        { id: 7, name: "Little Darlings Ltd", image: "https://web.archive.org/web/20170128092010im_/https://clubsave.ky/media/LDL_Logo-Blue240.jpg", description: "Cayman's one stop baby shop offering baby specialty items storewide. Our products include Bed Railings, Car Seats, Cradles, Cribs, Toddler Beds, Walkers, Shoes, Clothing, Fold and Go Playpens, Toys, Videos +more...", phone: "949-2580", email: "litdarl@candw.ky" },
        { id: 8, name: "G's & Gents", image: "https://web.archive.org/web/20170128160846im_/https://clubsave.ky/media/Gs__Gents240new_Tj0aSEe.jpg", description: "Caymans Exclusive Mens Outfitters. Get the finest in Men's wear for both G's and Gents. Familiar brands on the shelves include Timberland & Nike in a wide range of styles.", phone: "929-1234", email: "gsandgents.cayman@gmail.com" },
        { id: 9, name: "Godfrey's Enterprise Ltd.", image: "https://web.archive.org/web/20170128034740im_/https://clubsave.ky/media/godfrey2402_jVamm0f.jpg", description: "Giving the latest style in lingerie, clothing and shoes, here at our store we have something for all ages....Men, turn up your appearance 'swag' by coming to Godfrey's and purchasing our lovely Italian suits!", phone: "949-7953", email: "info@botanic-park.ky" },
        { id: 10, name: "Caribbean Jewellers", image: "https://web.archive.org/web/20170129013132im_/https://clubsave.ky/media/caribbean_jewellers240new.png", description: "Beautiful Gold pieces in stock always... Gold/Silver rings, coins, earrings, necklaces etc 3 Month layaway plans available!", phone: "945-7464", email: "Caribbeanjewellersltd@yahoo.com" },
        { id: 11, name: "Lil Monkeys", image: "https://web.archive.org/web/20170127041443im_/https://clubsave.ky/media/Lil_Monkeys_240new.jpg", description: "Offering fun and activities for your kids, also catering for special events and birthday parties... Indoor Activities:Arcade Games, Party Rooms, Mini swing sets, Toddler Area, Children Playground, Slides and Ball pool, Mobile ride on toys, Kids mini shopping center with cart.", phone: "949-2580", email: "lilmonkeyscayman@gmail.com" },
        { id: 12, name: "Ld's Sewing & Fashion Boutique", image: "https://web.archive.org/web/20170127082155im_/https://clubsave.ky/media/Lds_New_Logo.jpg", description: "Ld's Sewing wants to be your preferred choice for all your dressmaking and alteration needs. We are one of the only stores in the area to offer SAME DAY SERVICE to meet your last minute alteration needs.", phone: "323-1041", email: "ldsewing@yahoo.com" }
    ];
    return (
        <div id="kids" className="container mx-auto px-4 py-8 -mt-0">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Kids & Fashion</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {kidsActivities.map((activity) => (
                    <div key={activity.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
                        <div className="h-48 overflow-hidden">
                            <img src={activity.image} alt={activity.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="p-6 flex flex-col flex-grow">
                            <h3 className="text-xl font-semibold mb-2 text-gray-900">{activity.name}</h3>
                            <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">{activity.description}</p>
                            <button onClick={() => setSelectedActivity(activity)} className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded hover:bg-blue-700 transition-colors mt-auto">View Details</button>
                        </div>
                    </div>
                ))}
            </div>

            {selectedActivity && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedActivity(null)}>
                    <div className="bg-white rounded-lg max-w-4xl w-full overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedActivity(null)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10 bg-white rounded-full p-1">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <div className="flex flex-col md:flex-row">
                            <div className="w-full md:w-1/2 h-64 md:h-auto bg-gray-100 flex items-center justify-center p-4">
                                <img src={selectedActivity.image} alt={selectedActivity.name} className="max-w-full max-h-full object-contain" />
                            </div>
                            <div className="w-full md:w-1/2 p-8">
                                <h2 className="text-2xl font-bold mb-4 text-gray-900">{selectedActivity.name}</h2>
                                <p className="text-gray-600 mb-6">{selectedActivity.description}</p>
                                <div className="space-y-3 border-t pt-4">
                                    <div className="flex items-center text-gray-700"><span className="font-semibold w-20">Phone:</span><span>{selectedActivity.phone}</span></div>
                                    <div className="flex items-center text-gray-700"><span className="font-semibold w-20">Email:</span><span>{selectedActivity.email}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default KidsFashion