import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";
import { doc, getDoc, addDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import {
  Box,
  Button,
  TextField,
  Avatar,
  Card,
  CardContent,
  Typography,
  Rating,
} from "@mui/material";
import Loader from "../components/Loader";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, {
  EffectFade,
  Autoplay,
  Navigation,
  Pagination,
} from "swiper";
import "swiper/css/bundle";
import { BsShareFill } from "react-icons/bs";
import { toast } from "react-toastify";
import { MdLocationPin, MdOutlineChair } from "react-icons/md";
import { FaBath, FaBed, FaParking } from "react-icons/fa";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

const SingleListing = () => {
  const auth = getAuth();
  const params = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contactLandlord, setContactLandlord] = useState(false);
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [landlordReviews, setLandlordReviews] = useState([]);
  const [showLandlordReviewForm, setShowLandlordReviewForm] = useState(false);
  const [landlordRating, setLandlordRating] = useState(0);
  const [landlordReview, setLandlordReview] = useState('');
  const [averagePropertyRating, setAveragePropertyRating] = useState(0);
  const [averageLandlordRating, setAverageLandlordRating] = useState(0);
  const [filteredReviews, setFilteredReviews] = useState([]);
const [selectedRatingFilter, setSelectedRatingFilter] = useState(0); // 0 means no filter

  


  SwiperCore.use([Autoplay, Navigation, Pagination]);

  useEffect(() => {
    async function fetchListingAndReviews() {
      const docRef = doc(db, "listings", params.listingId);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        setListing(docSnap.data());
        setLoading(false);
  
        // Now fetch the reviews for the listing
        const reviewsRef = collection(db, "reviews");
        const q = query(reviewsRef, where("listingId", "==", params.listingId));
        const querySnapshot = await getDocs(q);
        const reviewsData = [];
        for (const documentSnapshot of querySnapshot.docs) {
          const reviewData = documentSnapshot.data();
          const userRef = doc(db, "users", reviewData.userId);
          const userSnap = await getDoc(userRef);
          const userName = userSnap.exists() ? userSnap.data().name : "Anonymous";
          const reviewTimestamp = reviewData.timestamp ? new Date(reviewData.timestamp.seconds * 1000) : null;
        reviewsData.push({
          id: documentSnapshot.id,
          userName,
          rating: reviewData.rating,
          comment: reviewData.comment,
          timestamp: reviewTimestamp
        });        }
        setReviews(reviewsData);
        console.log(reviewsData);
        const totalPropertyRating = reviewsData.reduce((acc, curr) => acc + curr.rating, 0);
        setAveragePropertyRating(reviewsData.length ? (totalPropertyRating / reviewsData.length) : 0);
  
        // Fetch landlord reviews only after listing is confirmed to exist
        if (docSnap.data().userRef) {
          const landlordRef = collection(db, "landlordReviews");
          const qLandlord = query(landlordRef, where("landlordId", "==", docSnap.data().userRef));
          const landlordSnapshot = await getDocs(qLandlord);
          const landlordReviewsData = [];
          for (const doc1 of landlordSnapshot.docs) {
            const data = doc1.data();
            const userRef = doc(db, "users", data.userId);
            const userSnap = await getDoc(userRef);
            const userName = userSnap.exists() ? userSnap.data().name : "Anonymous";
            const landlordTimestamp = data.timestamp ? new Date(data.timestamp.seconds * 1000) : null;
          landlordReviewsData.push({
            id: doc1.id,
            userName,
            rating: data.rating,
            comment: data.comment,
            timestamp: landlordTimestamp
          });
          }
          setLandlordReviews(landlordReviewsData);
          const totalLandlordRating = landlordReviewsData.reduce((acc, curr) => acc + curr.rating, 0);
          setAverageLandlordRating(landlordReviewsData.length ? (totalLandlordRating / landlordReviewsData.length) : 0);
        }
      } else {
        setLoading(false);
        toast.error("Listing not found.");
      }
    }
  
    if (params.listingId) {
      fetchListingAndReviews();
    }
  }, [params.listingId, db]);


  useEffect(() => {
    if (selectedRatingFilter === 0) {
      setFilteredReviews(reviews);
    } else {
      setFilteredReviews(reviews.filter(review => review.rating === selectedRatingFilter));
    }
  }, [reviews, selectedRatingFilter]); // Depend on reviews and the selected filter
  
  

const handleAddReview = async (e) => {
  e.preventDefault();
  if (rating === 0 || newReview.trim() === "") {
    toast.error("Please add a rating and a review before submitting.");
    return;
  }
  try {
    const docRef = await addDoc(collection(db, "reviews"), {
      userId: auth.currentUser.uid,
      listingId: params.listingId,
      rating: rating,
      comment: newReview,
      timestamp: serverTimestamp(),
    });
    const newReviewData = { id: docRef.id, userName: auth.currentUser.displayName || "Anonymous", rating, comment: newReview };
    const updatedReviews = [...reviews, newReviewData];
    setReviews(updatedReviews);
    const totalPropertyRating = updatedReviews.reduce((acc, curr) => acc + curr.rating, 0);
    setAveragePropertyRating(updatedReviews.length ? (totalPropertyRating / updatedReviews.length) : 0);
    setNewReview("");
    setRating(0);
    setShowReviewForm(false);
    toast.success("Review added successfully!");
  } catch (error) {
    console.error("Error adding review: ", error);
    toast.error("Error adding review. Please try again.");
  }
};

const handleAddLandlordReview = async (e) => {
  e.preventDefault();
  if (landlordRating === 0 || landlordReview.trim() === "") {
    toast.error("Please add a rating and a review for the landlord before submitting.");
    return;
  }
  try {
    const docRef = await addDoc(collection(db, "landlordReviews"), {
      userId: auth.currentUser.uid,
      landlordId: listing.userRef,
      rating: landlordRating,
      comment: landlordReview,
      timestamp: serverTimestamp(),
    });
    const newReviewData = { id: docRef.id, userName: auth.currentUser.displayName || "Anonymous", rating: landlordRating, comment: landlordReview };
    const updatedLandlordReviews = [...landlordReviews, newReviewData];
    setLandlordReviews(updatedLandlordReviews);
    const totalLandlordRating = updatedLandlordReviews.reduce((acc, curr) => acc + curr.rating, 0);
    setAverageLandlordRating(updatedLandlordReviews.length ? (totalLandlordRating / updatedLandlordReviews.length) : 0);
    setLandlordReview('');
    setLandlordRating(0);
    setShowLandlordReviewForm(false);
    toast.success("Landlord review added successfully!");
  } catch (error) {
    console.error("Error adding landlord review: ", error);
    toast.error("Error adding landlord review. Please try again.");
  }
};



  if (loading) {
    return <Loader />;
  }

  const afterDiscount = Number(listing.cost) - Number(listing.discount);
  const afterDiscountKsh = afterDiscount
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return (
    <main>
      <Swiper
        slidesPerView={1}
        navigation
        pagination={{ type: "bullets" }}
        effect="fade"
        modules={[EffectFade]}
        autoplay={{ delay: 3000 }}
      >
        {listing.imgUrls.map((url, i) => (
          <SwiperSlide key={i}>
            <div
              className="relative w-full overflow-hidden h-[400px]"
              style={{
                background: `url("${listing.imgUrls[i]}") center no-repeat`,
                backgroundSize: "cover",
              }}
            ></div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div
        className=" fixed text-[#007aff] top-[10%] right-[3%] z-10 cursor-pointc bg-[#e2e2e2] w-10 h-10 flex justify-center items-center rounded-full hover:bg-[#007aff] hover:text-[#e2e2e2] transition duration-500 ease-in-out"
        title="Copy Link to Property"
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          toast.success("Link to Property Copied 🎉");
        }}
      >
        <BsShareFill className="text-lg" />
      </div>
      <div className="bg-[#e2e2e2] mx-4 mt-4 mb-32 flex flex-col md:flex-row max-w-6xl lg:mx-auto p-4 rounded-lg shadow-lg gap-5">

        <div className="w-full relative">
          <p className="text-2xl font-bold mb-3 text-[#002470]">
            {listing.name} - USD{" "}
            {listing.offer
              ? listing.discount
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              : listing.cost
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
            {listing.type === "rent" ? "/month" : ""}
          </p>
          <div className="flex items-center gap-1">
            <MdLocationPin className="h-4 w-4 text-[#10192D]" />
            <p className="font-semibold text-base mb-[2px] text-[#202e3d]">
              {listing.address}
            </p>
          </div>
          <div className="flex justify-start items-center gap-5 w-[75%] my-3">
            <p className="bg-[#421414] text-[#fff] w-full max-w-[200px] rounded-md p-1 text-center font-semibold shadow-md">
              {listing.type}
            </p>
            {listing.offer && (
              <p className="w-full max-w-[200px] bg-[#007aff] text-[#10192D] rounded-md p-1 text-center font-semibold shadow-md">
                USD {afterDiscountKsh}{" "}
                <span className=" font-bold">discount</span>
              </p>
            )}
          </div>
          <p>
            {" "}
            <span className=" font-semibold text-lg text-[#162433]">
              Description:{" "}
            </span>{" "}
            {listing.description}
          </p>
          <div className="flex items-center my-3 gap-10">
            <div className="flex items-center gap-1">
              <FaBed />
              <p className="font-bold text-sm">
                {listing.bedrooms > 1 ? `${listing.bedrooms} Beds` : "1 Bed"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <FaBath />
              <p className="font-bold text-sm">
                {listing.restrooms > 1
                  ? `${listing.restrooms} Rests`
                  : "1 Rest"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <FaParking />
              <p className="font-bold text-sm">
                {listing.parking ? "Available Parking" : "No Parking"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <MdOutlineChair />
              <p className="font-bold text-sm">
                {listing.furnish ? "Furnished" : "Not Furnished"}
              </p>
            </div>
          </div>
          {listing.userRef !== auth.currentUser?.uid && !contactLandlord && (
            
            <div className="static w-full bottom-1 md:absolute">
              <br />
              <br />
              <br />
              <button
                onClick={() => setContactLandlord(true)}
                className=" w-full bg-[#10192D] text-[#fff] font-medium uppercase shadow-md hover:shadow-lg px-7 py-3 rounded cursor-pointc text-base hover:bg-[#192d41] transition duration-150 ease-in-out focus:bg-[#10192D] focus:shadow-lg text-center"
              >
                Contact Landlord
              </button>
            </div>
          )}
          {contactLandlord && (
            <Contact userRef={listing.userRef} listing={listing} />
          )}
          <Button
            onClick={() => navigate(`/schedule-visit/${params.listingId}`)}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            variant="outlined"
          >
            Book Virtual Visit
          </Button>
          <br />
          <br />
          <Button
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={() => setShowReviewForm(!showReviewForm)}
          >
            Add Property Review
          </Button>
		  <Button
    variant="outlined"
    sx={{ mt: 2 }}
    onClick={() => setShowLandlordReviewForm(!showLandlordReviewForm)}
>
    Rate Landlord
</Button>
<br />
<br />

<Typography variant="h6"> Property Rating: <Rating value={averagePropertyRating} readOnly /></Typography>
<Typography variant="h6"> Landlord Rating: <Rating value={averageLandlordRating} readOnly /></Typography>
<br />
<br />
        </div>

        <div className=" w-full h-[200px] md:h-[400px] z-10 overflow-x-hidden mt-6 md:mt-0 md:ml-2 rounded">
          <MapContainer
            center={[listing.geolocation.lat, listing.geolocation.lng]}
            zoom={13}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
              position={[listing.geolocation.lat, listing.geolocation.lng]}
            >
              <Popup>{listing.address}</Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>


      {/*  update the front end styling from here */}
      {showReviewForm && (
  <Box
    component="form"
    onSubmit={handleAddReview}
    noValidate
    sx={{
      mt: 1,
      p: 3,
      backgroundColor: '#f3f3f3',
      borderRadius: 2,
      boxShadow: 1
    }}
  >
    <TextField
      margin="normal"
      required
      fullWidth
      id="review"
      label="Your Review"
      name="review"
      autoFocus
      multiline
      rows={4}
      value={newReview}
      onChange={(e) => setNewReview(e.target.value)}
      variant="outlined"
    />
    <Rating
      name="simple-controlled"
      value={rating}
      onChange={(event, newValue) => {
        setRating(newValue);
      }}
      sx={{ mt: 2 }}
    />
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
      <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ width: '48%' }}
      >
          Submit Property Review
      </Button>
      <Button
          variant="outlined"
          sx={{ width: '48%' }}
          onClick={() => setShowReviewForm(false)}
      >
          Cancel
      </Button>
    </Box>
  </Box>
)}

{showLandlordReviewForm && (
  <Box
    component="form"
    onSubmit={handleAddLandlordReview}
    noValidate
    sx={{
      mt: 2,
      p: 3,
      backgroundColor: '#f3f3f3',
      borderRadius: 2,
      boxShadow: 1
    }}
  >
    <TextField
      margin="normal"
      required
      fullWidth
      id="landlordReview"
      label="Your Review for the Landlord"
      name="landlordReview"
      autoFocus
      multiline
      rows={4}
      value={landlordReview}
      onChange={(e) => setLandlordReview(e.target.value)}
      variant="outlined"
    />
    <Rating
      name="landlord-rating-controlled"
      value={landlordRating}
      onChange={(event, newValue) => {
        setLandlordRating(newValue);
      }}
      sx={{ mt: 2 }}
    />
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
      <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ width: '48%' }}
      >
          Submit Review
      </Button>
      <Button
          color="error"
          variant="outlined"
          sx={{ width: '48%' }}
          onClick={() => setShowLandlordReviewForm(false)}
      >
          Cancel
      </Button>
    </Box>
  </Box>
)}
<Box sx={{ my: 2 }}>
  {[1, 2, 3, 4, 5].map(rating => (
    <Button
      key={rating}
      variant="contained"
      onClick={() => setSelectedRatingFilter(rating)}
      sx={{ mx: 1 }}
    >
      {rating} Star{rating > 1 ? 's' : ''}
    </Button>
  ))}
  <Button variant="outlined" onClick={() => setSelectedRatingFilter(0)}>Clear Filter</Button>
</Box>

{reviews.length > 0 && (
  <Box sx={{ mt: 4 }}>
    <Typography variant="h5">Property Reviews</Typography>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
    {filteredReviews.map((review) => (
      <Card key={review.id} sx={{ width: 300, mb: 2, p: 2, backgroundColor: '#e9ecef' }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>{review.userName.charAt(0)}</Avatar>
            <Typography variant="subtitle1" sx={{ ml: 1 }}>
              {review.userName}
            </Typography>
          </Box>
          <Rating value={review.rating} readOnly />
          <Typography variant="body2" color="textSecondary">
            {review.comment}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {review.timestamp ? review.timestamp.toLocaleString() : "No timestamp available"}
          </Typography>
        </CardContent>
      </Card>
    ))}
    </Box>
  </Box>
)}


<Box sx={{ mt: 4 }}>
  <Typography variant="h5">Landlord Reviews</Typography>
  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
    {landlordReviews.length > 0 ? (
      landlordReviews.map(review => (
        <Card key={review.id} sx={{ width: 300, mb: 2, p: 2, backgroundColor: '#e9ecef' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'secondary.main' }}>{review.userName.charAt(0)}</Avatar>
              <Typography sx={{ ml: 1 }}>{review.userName}</Typography>
            </Box>
            <Rating value={review.rating} readOnly />
            <Typography color="textSecondary">{review.comment}</Typography>
            <Typography color="textSecondary">
            {review.timestamp ? review.timestamp.toLocaleString() : "No timestamp available"}

            </Typography>
          </CardContent>
        </Card>
      ))
    ) : (
      <Typography>No reviews for this landlord yet.</Typography>
    )}
  </Box>
</Box>



      <br />
      <br />
      <br />
      <br />
      <Footer />
    </main>
  );
};

export default SingleListing;
