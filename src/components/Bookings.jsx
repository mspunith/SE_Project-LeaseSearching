import { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; 
import "react-datepicker/dist/react-datepicker.css";
import Modal_card from './popModal';
import ApartmentIcon from '@mui/icons-material/Apartment';
import { Modal, Box, Typography, Button } from '@mui/material';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const BookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        const fetchBookings = async () => {
            const bookingsRef = collection(db, 'bookings');
            const querySnapshot = await getDocs(bookingsRef);
            const bookingsWithDetails = [];
            for (let docSnapshot of querySnapshot.docs) { 
                const booking = { id: docSnapshot.id, ...docSnapshot.data() };
                // Fetch property details
                const propertyRef = doc(db, 'listings', booking.propertyId);
                const propertyDoc = await getDoc(propertyRef);
                if (propertyDoc.exists()) {
                    booking.propertyDetails = propertyDoc.data();
                }
                bookingsWithDetails.push(booking);
            }
            setBookings(bookingsWithDetails);
        };
    
        fetchBookings();
    }, []);
    

    const handleOpenModal = (booking) => {
        setSelectedBooking(booking);
        setOpenModal(true);
    };

    const handleCloseModal = () => setOpenModal(false);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold text-center mb-4">My Bookings</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookings.map((booking) => (
                    <div key={booking.id} className="bg-white shadow-md rounded-lg p-4 cursor-pointer" onClick={() => handleOpenModal(booking)}>
                        <ApartmentIcon /> {/* Example icon, replace or remove as needed */}
                        <h2 className="text-xl font-semibold mb-2">{booking.propertyDetails?.name}</h2>
                        <p>Date: {booking.date}</p>
                        <p>Time Slot: {booking.timeSlot}</p>
                        {/* More details can be shown here or in the modal */}
                    </div>
                ))}
            </div>

            {selectedBooking && (
                <Modal_card
                    open={openModal}
                    onClose={handleCloseModal}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style}>
                        <Typography id="modal-modal-title" variant="h6" component="h2">
                            {selectedBooking.propertyDetails?.name}
                        </Typography>
                        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                            Address: {selectedBooking.propertyDetails?.address}
                        </Typography>
                        <Typography>Date: {selectedBooking.date}</Typography>
                        <Typography>Time Slot: {selectedBooking.timeSlot}</Typography>
                        <Typography>Email: {selectedBooking.userEmail}</Typography>
                        <Button variant="contained" color="primary" href={`http://localhost:5173/category/${selectedBooking.propertyDetails?.category}/${selectedBooking.propertyId}`} target="_blank">
                            View Property
                        </Button>
                        {/* Add Image and any other needed details */}
                    </Box>
                </Modal_card>
            )}
        </div>
    );
};

export default BookingsPage;
