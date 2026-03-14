import React, { useState } from 'react'

const BeautyBarber = () => {
  const [selectedStore, setSelectedStore] = useState(null);

  const stores = [
    { id: 1, name: "George Carvalho", image: "https://web.archive.org/web/20161021122644im_/https://clubsave.ky/media/GC_logo240.jpg", description: "George Carvalho International Beauty Salon & Spa is a full service salon and spa located on Seven Mile Beach.For all your hair needs: coloring, cutting, straightening, formal wear for all occasions. Beauty needs: facial, waxing, lash extensions & make up.", phone: "946-1912", email: "info@georgecarvalho.ky" },
    { id: 2, name: "Focus Hair & Beauty", image: "https://web.archive.org/web/20161021122644im_/https://clubsave.ky/media/FOCUS_hair__beauty_logo240.png", description: "Experience Grand Cayman's finest hair stylists, colourists and beauty therapists... We FOCUS our attention on you with first-class hairstyles, facials, massages, manicures, pedicures and more – all in our relaxing, friendly salon found just off Seven Mile Beach.", phone: "943-6287", email: "info@focussalon.com" },
    { id: 3, name: "Tatianna's Heaven on Earth Beauty Salon", image: "https://web.archive.org/web/20161021122644im_/https://clubsave.ky/media/Tatiannas_Heaven_on_Earth_240_new.jpg", description: "With a well known name in Cayman, Tatianna's Heaven on Earth Beauty Salon speaks for itself. Ladies when in need to pamper yourself, look no further, come and see us today. Men we offer professional business hair cuts that are known to impress.", phone: "946-7522/945-7522", email: "tatiannasbeauty@candw.ky" },
    { id: 4, name: "Club Save", image: "https://web.archive.org/web/20161021122644im_/https://clubsave.ky/media/Club_Save__Logo_for_website_240x240_K6YErZi.jpg", description: "Our website is the only platform built strictly for people to view dozens of promotional ads from local businesses. You can always view sales or upcoming events that our business members are having, which results in saving money! We also offer memberships to both people and businesses in the Cayman Islands.", phone: "+1 (345) 943-6287", email: "appointments@focus.ky" }
  ];
  return (
    <div id="beauty" className="container mx-auto px-4 py-8 -mt-0">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Beauty & Barber</h2>
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

export default BeautyBarber