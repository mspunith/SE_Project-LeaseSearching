import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import Loader from '../components/Loader';
import ListingItem from '../components/ListingItem';
import Footer from '../components/Footer';
import { toast } from 'react-toastify';

const FilterListings = () => {
    const [allListings, setAllListings] = useState([]);
    const [filteredListings, setFilteredListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        type: '',
        minimumDiscount: 0,
        minimumRating: 0,
        beds: '',
        baths: '',
        parking: false,
        furnished: false,
        sortClosest: false
    });

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const snapshot = await getDocs(collection(db, 'listings'));
                const listingsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    data: doc.data()
                }));
                setAllListings(listingsData);
                setLoading(false);
            } catch (error) {
                toast.error('Could not fetch Listings');
            }
        };

        fetchListings();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters, allListings]);

    const applyFilters = () => {
        let results = [...allListings];

        results = results.filter(listing => {
            return (!filters.type || listing.data.type === filters.type) &&
                   (filters.minimumDiscount <= 0 || (listing.data.discount && listing.data.discount >= filters.minimumDiscount)) &&
                   (filters.minimumRating <= 0 || (listing.data.rating && listing.data.rating >= filters.minimumRating)) &&
                   (!filters.beds || listing.data.bedrooms >= filters.beds) &&
                   (!filters.baths || listing.data.bathrooms >= filters.baths) &&
                   (!filters.parking || listing.data.parking === true) &&
                   (!filters.furnished || listing.data.furnish === true);
        });

        setFilteredListings(results);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const clearFilters = () => {
        setFilters({
            type: '',
            minimumDiscount: 0,
            minimumRating: 0,
            beds: '',
            baths: '',
            parking: false,
            furnished: false,
            sortClosest: false
        });
    };

    return (
        <div className="flex">
            <div className="flex flex-col w-1/3 p-4">
                <h2 className="text-xl font-bold mb-4">Filter Options</h2>
                {/* Filter Form Starts Here */}
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">Type:</label>
                    <select name="type" value={filters.type} onChange={handleChange} className="form-select">
                        <option value="">All Types</option>
                        <option value="rent">Rent</option>
                        <option value="sale">Sale</option>
                        <option value="temporary">Temporary</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">Minimum Discount:</label>
                    <input type="number" name="minimumDiscount" value={filters.minimumDiscount} onChange={handleChange} className="form-input" placeholder="Enter minimum discount" />
                </div>
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">Minimum Rating:</label>
                    <input type="number" name="minimumRating" value={filters.minimumRating} onChange={handleChange} className="form-input" min="1" max="5" placeholder="1-5 stars" />
                </div>
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">Beds:</label>
                    <input type="number" name="beds" value={filters.beds} onChange={handleChange} className="form-input" placeholder="Number of beds" />
                </div>
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">Baths:</label>
                    <input type="number" name="baths" value={filters.baths} onChange={handleChange} className="form-input" placeholder="Number of baths" />
                </div>
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">Parking:</label>
                    <select name="parking" value={filters.parking} onChange={handleChange} className="form-select">
                        <option value="">All</option>
                        <option value="true">Available</option>
                        <option value="false">Not Available</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">Furnished:</label>
                    <select name="furnished" value={filters.furnished} onChange={handleChange} className="form-select">
                        <option value="">All</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                </div>
                <button onClick={clearFilters} className="mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-700">Clear Filters</button>
            </div>
            <div className="w-2/3 p-4">
                <h1 className="text-3xl font-semibold text-center mb-4">Filtered Listings</h1>
                <div>
                    {loading ? <Loader /> : (
                        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredListings.map((listing) => (
                                <ListingItem key={listing.id} id={listing.id} listing={listing.data} />
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FilterListings;
