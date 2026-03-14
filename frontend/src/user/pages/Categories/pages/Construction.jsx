import React, { useState } from 'react'

const Construction = () => {
    const [selectedCompany, setSelectedCompany] = useState(null);

    const companies = [
        { id: 1, name: "Caribbean Property Management", image: "https://web.archive.org/web/20161021122644im_/https://clubsave.ky/media/Caribbean_Property_Management240.jpg", description: "We are here to give you the customer the highest standard of property management services at an affordable price.", phone: "9382024/9244149", email: "carib.propertymanagement@gmail.com" },
        { id: 2, name: "Air Source", image: "https://web.archive.org/web/20161021122644im_/https://clubsave.ky/media/Air_Source_PDF_Logo_-_240x240new.jpg", description: "Air Conditioning systems & Appliances. The number one source for all your air conditioning needs. Providing our customers with quick, efficient and cost effective service at your earliest convenience.", phone: "949-5900", email: "godfreyb@candw.ky" },
        { id: 3, name: "Perfect Mobile Pressure Washing & Car Wash", image: "https://web.archive.org/web/20161021122644im_/https://clubsave.ky/media/Perfect_Mobile_Pressure_Washing_logo_240X2402_7D2LSsC.jpg", description: "We do Mobile Pressure Washing on:Auto's, Boats ,Decks, Drive-ways, Walk-ways, Parking lots, Buildings of all sizes etc.. We have the right equipment to get the job done for all your needs. Free Estimates!", phone: "922-3807 / 325-5205 / 922-7234", email: "perfect.designs@hotmail.com" },
        { id: 4, name: "Cox Lumber Ltd.", image: "https://web.archive.org/web/20161021122644im_/https://clubsave.ky/media/Cox_Lumber_240x240_new.png", description: "Your lumber and more store… In business for over 65 years, Cox Lumber is your #1 destination in the Cayman Islands for building materials, doors, windows, paint, hardware and so much more. Cox Lumber prides itself in having the experts on hand to assist you, with an average of 15 years experience in their respective fields.", phone: "949-0661", email: "info@coxlumberltd.com" },
        { id: 5, name: "Artic Air Conditoning Plumbing & Maintenance", image: "https://web.archive.org/web/20161021122644im_/https://clubsave.ky/media/Artic_Airconditioning.jpg", description: "Artic Air Conditioning Plumbing & Maintenance \"24 HRS SERVICE\" is a very friendly, reliable and professional company. Our aim is to keep our customers cool and comfortable with our high efficiency air conditioning units at very reasonable prices.", phone: "917-0350", email: "cayman@bcqs.com" }
    ];
    return (
        <div id="construction" className="container mx-auto px-4 py-8 -mt-0">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Construction</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {companies.map((company) => (
                    <div key={company.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
                        <div className="h-48 overflow-hidden">
                            <img src={company.image} alt={company.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="p-6 flex flex-col flex-grow">
                            <h3 className="text-xl font-semibold mb-2 text-gray-900">{company.name}</h3>
                            <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">{company.description}</p>
                            <button onClick={() => setSelectedCompany(company)} className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded hover:bg-blue-700 transition-colors mt-auto">View Details</button>
                        </div>
                    </div>
                ))}
            </div>

            {selectedCompany && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedCompany(null)}>
                    <div className="bg-white rounded-lg max-w-4xl w-full overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedCompany(null)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10 bg-white rounded-full p-1">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <div className="flex flex-col md:flex-row">
                            <div className="w-full md:w-1/2 h-64 md:h-auto bg-gray-100 flex items-center justify-center p-4">
                                <img src={selectedCompany.image} alt={selectedCompany.name} className="max-w-full max-h-full object-contain" />
                            </div>
                            <div className="w-full md:w-1/2 p-8">
                                <h2 className="text-2xl font-bold mb-4 text-gray-900">{selectedCompany.name}</h2>
                                <p className="text-gray-600 mb-6">{selectedCompany.description}</p>
                                <div className="space-y-3 border-t pt-4">
                                    <div className="flex items-center text-gray-700"><span className="font-semibold w-20">Phone:</span><span>{selectedCompany.phone}</span></div>
                                    <div className="flex items-center text-gray-700"><span className="font-semibold w-20">Email:</span><span>{selectedCompany.email}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Construction