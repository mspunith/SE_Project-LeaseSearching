import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import DatePicker from "react-datepicker";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import Modal_card from './popModal';
import { getAuth } from "firebase/auth";
const apiKey = import.meta.env.VITE_REACT_APP_API_KEY;

const ScheduleTour = () => {
    const { listingId } = useParams();
    const [listing, setListing] = useState({});
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [userEmail, setUserEmail] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [availableSlots, setAvailableSlots] = useState([]);
    const auth = getAuth();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Time slots now as integers representing hours
    const timeSlots = Array.from({ length: 9 }, (_, i) => 11 + i); // 11 to 19

    useEffect(() => {
        if (listingId && selectedDate) {
            fetchAvailableSlots(selectedDate);
        }
    }, [listingId, selectedDate]);

    const handleBooking = async () => {
        if (auth.currentUser && validateEmail(userEmail)) {
            const bookingRef = collection(db, "bookings");
            const formattedDate = selectedDate.toISOString().split('T')[0];
            // Attempt to create a booking document in Firestore
            try {
                await addDoc(bookingRef, {
                    date: formattedDate,
                    timeSlot: selectedSlot.value,
                    propertyId: listingId,
                    userId: auth.currentUser.uid,
                    userEmail: userEmail
                });
    
                // Upon successful booking, attempt to create a calendar event
                try {
                    const calendarLink = createGoogleCalendarLink(selectedDate, selectedSlot.value, 'Property Tour Booking', 'A virtual tour of the property.', listing.address);
                    window.open(calendarLink, '_blank');
                    navigate(`/bookings`);
                    setShowModal(false);
                    setUserEmail(""); // Reset email field after booking
                    navigate(`/bookings`); // Redirect to bookings page after successful booking
                } catch (error) {
                    console.error("Error creating calendar event, please add it manually:", error);
                    const calendarLink = createGoogleCalendarLink(selectedDate, selectedSlot.value, 'Property Tour Booking', 'A virtual tour of the property.', listing.address);
                    window.open(calendarLink, '_blank');
                    navigate(`/bookings`);
                    alert('Your booking was successful, but there was an error sending a calendar invite. Please manually add your booking to your calendar.');
                }
            } catch (error) {
                console.error("Error saving booking to Firestore:", error);
                alert("There was an error scheduling your tour. Please try again.");
            }
        } else {
            console.error("User not authenticated or email is invalid");
            alert("Invalid Email address. Please update it.");
        }
    };

    const createGoogleCalendarLink = (date, timeSlot, summary, description, location) => {
        const startTime = new Date(date.setHours(timeSlot, 0, 0)).toISOString().replace(/-|:|\.\d\d\d/g, '');
        const endTime = new Date(date.setHours(timeSlot + 1, 0, 0)).toISOString().replace(/-|:|\.\d\d\d/g, '');
        const baseURL = 'https://www.google.com/calendar/render?action=TEMPLATE';
        
        return `${baseURL}&text=${encodeURIComponent(summary)}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}&dates=${startTime}/${endTime}`;
      };
    

    useEffect(() => {
        const fetchListing = async () => {
            setLoading(true);
            const docRef = doc(db, "listings", listingId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setListing(docSnap.data());
                setLoading(false);
            } else {
                console.log("No such listing!");
                setLoading(false);
            }
        };
        fetchListing();
    }, [listingId]);

    const fetchAvailableSlots = async (date) => {
        const formattedDate = date.toISOString().split('T')[0];
        const bookingsRef = collection(db, "bookings");
        const q = query(bookingsRef, where("propertyId", "==", listingId), where("date", "==", formattedDate));
        
        const querySnapshot = await getDocs(q);
        const bookedSlots = querySnapshot.docs.map(doc => parseInt(doc.data().timeSlot));

        const slots = timeSlots.map(slot => ({
            value: slot,
            label: formatSlot(slot),
            color: bookedSlots.includes(slot) ? 'red' : 'green'
        }));

        setAvailableSlots(slots);
    };

    const formatSlot = (slot) => {
        return `${slot}:00 ${slot < 12 ? 'AM' : 'PM'}`;
    };

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

  async function myBackendServiceCreateEvent(event, API_KEY) {
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
  
    return response.json();
  }

  const createCalendarEvent = async (date, timeSlot, userEmail) => {
    // Adjust time zone and format dateTime as needed
    const startDateTime = new Date(date.setHours(timeSlot, 0, 0)).toISOString();
    const endDateTime = new Date(date.setHours(timeSlot + 1, 0, 0)).toISOString();

    const event = {
      summary: 'Property Tour Booking',
      description: 'A virtual tour of the property.',
      start: { dateTime: startDateTime },
      end: { dateTime: endDateTime },
      attendees: [{ email: userEmail }],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 10 },
        ],
      },
    };

    const API_KEY = apiKey;
    try {
      const response = await myBackendServiceCreateEvent(event, API_KEY);
      if (response && response.status === 'confirmed') {
        alert('Booking confirmed! A calendar invite has been sent to your email.');
      } else {
        alert('There was an error scheduling your tour. Please try again.');
      }
    } catch (error) {
      console.error("Error creating calendar event:", error);
      alert('There was an error scheduling your tour. Please try again.');
    }
  };

  const handleBookingConfirmation = () => {
    const calendarLink = createGoogleCalendarLink(selectedDate, selectedSlot.value, 'Property Tour Booking', 'A virtual tour of the property.', listing.address);
    console.log('Add to your calendar:', calendarLink);
    window.open(calendarLink, '_blank');
  };
  

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold text-center mb-4">{listing.name}</h1>
            <p className="text-lg text-center mb-6">{listing.address}</p>

            <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-8">
                <h2 className="text-xl font-semibold mb-4">Schedule a Virtual Visit</h2>
                <DatePicker className="mb-4 w-full p-2 border rounded" selected={selectedDate} onChange={(date) => setSelectedDate(date)} />
                <Select
                    className="mb-4"
                    options={availableSlots}
                    value={selectedSlot}
                    onChange={setSelectedSlot}
                    placeholder="Select a time slot"
                    styles={{
                        option: (styles, { data }) => ({
                            ...styles,
                            backgroundColor: data.color,
                            cursor: data.color === 'red' ? 'not-allowed' : 'pointer'
                        })
                    }}
                    isOptionDisabled={(option) => option.color === 'red'}
                />

                <input
                    type="email"
                    placeholder="Your email address"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="mb-4 w-full p-2 border rounded"
                />
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full" onClick={() => setShowModal(true)}>
                    Book Visit
                </button>
            </div>

            {showModal && (
                <Modal_card onClose={() => setShowModal(false)} onConfirm={handleBooking}>
                    <h3 className="text-xl font-semibold">Confirm Your Booking</h3>
                    <p className="mb-4">Please confirm your virtual visit details:</p>
                    <p>Date: {selectedDate.toLocaleDateString()}</p>
                    <p>Time Slot: {selectedSlot?.label}</p>
                    <p>Email : {userEmail}</p>
                    {/* Add any additional information or confirmation details here */}
                    <button className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onClick={handleBooking}>
                        Confirm Booking
                    </button>
                </Modal_card>
            )}
        </div>
    );
};

export default ScheduleTour;
