import React from "react";

const countries = ["India", "USA", "UK"];
const states = ["Maharashtra", "California", "London"];
const cities = {
  India: ["Mumbai", "Delhi", "Bangalore"],
  USA: ["New York", "California", "Texas"],
  UK: ["London", "Manchester", "Bristol"],
};

export default function SettingsPage() {
  const [selectedCountry, setSelectedCountry] = React.useState("");
  const [selectedState, setSelectedState] = React.useState("");
  const [selectedCity, setSelectedCity] = React.useState("");

  // Update cities when country/state changes
  React.useEffect(() => {
    setSelectedState("");
    setSelectedCity("");
  }, [selectedCountry]);

  React.useEffect(() => {
    setSelectedCity("");
  }, [selectedState]);

  return (
    <div className="bg-white rounded-lg shadow-md p-8 max-w-5xl mx-auto">
      {/* Title */}
      <h1 className="text-2xl font-bold mb-8 border-b border-gray-200 pb-4">
        Settings
      </h1>

      {/* Basic Information Section */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-6">Basic Information</h2>

        <div className="flex items-center space-x-6 mb-8">
          <label
            htmlFor="profileImage"
            className="block text-sm font-medium text-gray-700 w-36"
          >
            Profile Image <span className="text-red-600">*</span>
          </label>

          <div className="relative">
            <img
              src="https://randomuser.me/api/portraits/men/75.jpg"
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border border-gray-300"
            />
            <button
              type="button"
              className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-1 shadow"
              aria-label="Change Profile Image"
              title="Change Profile Image"
            >
              ✎
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700"
            >
              First Name <span className="text-red-600">*</span>
            </label>
            <input
              id="firstName"
              type="text"
              placeholder="First Name"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700"
            >
              Last Name <span className="text-red-600">*</span>
            </label>
            <input
              id="lastName"
              type="text"
              placeholder="Last Name"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email <span className="text-red-600">*</span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Phone Number <span className="text-red-600">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="Phone Number"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
        </div>
      </section>

      {/* Address Information Section */}
      <section>
        <h2 className="text-lg font-semibold mb-6">Address Information</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6">
          <div>
            <label
              htmlFor="address1"
              className="block text-sm font-medium text-gray-700"
            >
              Address Line 1
            </label>
            <input
              id="address1"
              type="text"
              placeholder="Address Line 1"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="address2"
              className="block text-sm font-medium text-gray-700"
            >
              Address Line 2
            </label>
            <input
              id="address2"
              type="text"
              placeholder="Address Line 2"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="country"
              className="block text-sm font-medium text-gray-700"
            >
              Country
            </label>
            <select
              id="country"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="state"
              className="block text-sm font-medium text-gray-700"
            >
              State
            </label>
            <select
              id="state"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={!selectedCountry}
            >
              <option value="">Select</option>
              {states
                .filter((state) =>
                  selectedCountry
                    ? // Optional: Add country-based filtering here
                      true
                    : false
                )
                .map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="city"
              className="block text-sm font-medium text-gray-700"
            >
              City
            </label>
            <select
              id="city"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={!selectedState}
            >
              <option value="">Select</option>
              {(cities[selectedCountry] || []).map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="pincode"
              className="block text-sm font-medium text-gray-700"
            >
              Pincode
            </label>
            <input
              id="pincode"
              type="text"
              placeholder="Pincode"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </section>

      {/* Buttons */}
      <div className="flex justify-end space-x-4 mt-10">
        <button
          type="button"
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
