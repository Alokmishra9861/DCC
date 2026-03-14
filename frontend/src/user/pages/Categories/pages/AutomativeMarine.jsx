import React, { useState } from 'react'
import AppImage from '../../../components/ui/AppImage';

const AutomativeMarine = () => {
   const [selectedStore, setSelectedStore] = useState(null);
  const stores = [
    {
      id: 1,
      name: "L.A.W. Imports",
      image: 'https://web.archive.org/web/20170128033721im_/https://clubsave.ky/media/L.A.W._Imports_240x240.jpg2.jpg', description: "We import a variety of pre-owned vehicles for sale in the Cayman Islands. With the exception of special orders, none of the vehicles we sell cost more than $10,000 C.I. We do not purchase vehicles that have an “accident history”, “major repairs” or “panels replaced”.",
      phone: '922-7188',
      email: 'lawimports@gmail.com'
    },
    {
      id: 2,
      name: 'Vampt Motors',
      image: 'https://web.archive.org/web/20170128001411im_/https://clubsave.ky/media/Vampt_logo_-_stackednew_240final.jpg',
      description: 'Vampt Motors Sales Department opened in August 1968 to serve the Cayman Islands and its first full service automobile dealership. Our goal is not to sell a car, but to build a lasting relationship with our customers. We thank you in advance for choosing Vampt Motors for your transportation needs.',
      phone: ' 949-2245',
      email: 'sales@vamptmotors.com '
    },
    {
      id: 3,
      name: "Tony's Toys",
      image: 'https://web.archive.org/web/20170129050433im_/https://clubsave.ky/media/Tonys_Toys_New_Logonew240.jpg',
      description: 'From humble beginnings, Tony’s Toys has grown into the finest state-of-the-art independent automotive center featuring; a full service garage, a body shop and parts division and a wide selection of new and pre-owned cars for sale/lease. Whether it’s a hard-to-find car part or a simple oil change, you will get the best service possible – and that, as Tony would say, “is the true position.”',
      phone: '946-TOYS (8697)',
      email: 'ales@tonystoys.net'
    },
    {
      id: 4,
      name: 'AutoZone',
      image: 'https://web.archive.org/web/20200811165616im_/https://clubsave.ky/wp-content/uploads/2020/06/AutoZone-Logo-300x300.png',
      description: 'AutoZone: Your one-stop shop for auto parts and accessories.',
      phone: '345-567-8901',
      email: 'info@autozone.ky'
    },
    {
      id: 5,
      name: 'Rubis Walkers Road',
      image: 'https://web.archive.org/web/20170127230257im_/https://clubsave.ky/media/Rubis_Walkers_road_240x240_2EvZKNy.jpg',
      description: 'Visit our service station and save money on all gasoline purchases... Open 24 hrs, 7 days a week! Let us serve you with a huge selection of everyday necessities to choose from: Water Bottle Cooked Food Canteen Snacks to go Coffee Cell phone Top-Ups (CNB) ATM Machine Vehicle Accessories Engine fluids & so much more...',
      phone: '949-8451',
      email: 'info@rubiswalkers.ky'
    },
    {
      id: 6,
      name: 'Bat mobile repair',
      image: 'https://web.archive.org/web/20161021122644im_/https://clubsave.ky/media/Bat__mobile_repair_240x240_1.jpg',
      description: 'Visit our service station and save money on all gasoline purchases... Open 24 hrs, 7 days a week! Let us serve you with a huge selection of everyday necessities to choose from: Water Bottle Cooked Food Canteen Snacks to go Coffee Cell phone Top-Ups (CNB) ATM Machine Vehicle Accessories Engine fluids & so much more...',
      phone: '949-8451',
      email: 'info@rubiswalkers.ky'
    },
    {
      id: 7,
      name: 'Perfect Mobile Pressure Washing & Car Wash',
      image: 'https://web.archive.org/web/20170128144422im_/https://clubsave.ky/media/Perfect_Mobile_Pressure_Washing_logo_240X2402_7D2LSsC.jpg',
      description:"'We do Mobile Pressure Washing on: Auto's Boats Decks Drive-ways Walk-ways Parking lots Buildings of all sizes etc.. We have the right equipment to get the job done for all your needs.",
      phone: ' 922-3807',
      email: 'perfect.designs@hotmail.com'
    },
    {
      id: 8,
      name: 'Automotive Art',
      image: 'https://web.archive.org/web/20170128103237im_/https://clubsave.ky/media/AART_Logo_Your_Car240x2402.jpg',
      description:"Automotive Art is the Caribbean's largest Auto-Care retailer of car enhancement products and services. With its corporate headquarters in Barbados, it currently trades in over 24 countries, inclusive of 14 Automotive Art franchise stores in eight countries throughout the Caribbean.",
      phone: '949-7102',
      email: 'automative@art.com'
    },
    {
      id: 9,
      name: 'AA Rubis Seven Mile Beach',
      image: 'https://web.archive.org/web/20170127122001im_/https://clubsave.ky/media/Rubis_SMB_240x240.png',
      description:"Let us fuel your car saving you money on gasoline instantly, as we are a proud member of Club Save! Choose from a selection of great snacks to go: Hot dogs, Patties, Sandwiches, Pizza and so much more...",
      phone: '949-7603',
      email:"rubis@seven.com",
    },
    {
      id: 10,
      name: 'Artic Air Conditoning Plumbing & Maintenance',
      image: 'https://web.archive.org/web/20170128074321im_/https://clubsave.ky/media/Artic_Airconditioning.jpg',
      description:"Artic Air Conditioning Plumbing & Maintenance “24 HRS SERVICE” is a very friendly, reliable and professional company. Our aim is to keep our customers cool and comfortable with our high efficiency air conditioning units at very reasonable prices.",
      phone: '917-0350 ',
      email:"artic@air.com",
    }
  ];
  return (
    <div id="beauty" className="container mx-auto px-4 py-8 -mt-0">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Automative Marine</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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

export default AutomativeMarine