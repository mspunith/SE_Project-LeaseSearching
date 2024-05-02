import React, { useState,useEffect } from 'react';
import { TextField, Button, Container, Typography, Grid, MenuItem } from '@mui/material';
import jsPDF from "jspdf";
import { db } from "../firebase"; 
import { collection, addDoc, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { useNavigate } from 'react-router-dom';

const LeaseAgreementForm = () => {
    const [formData, setFormData] = useState({
        tenantId: '',
        landlordName: '',
        propertyAddress: '',
        leaseStartDate: '',
        leaseEndDate: '',
        monthlyRent: '',
        securityDeposit: '',
        lateFee: '',
        status: 'awaiting',
    });

    const [tenants, setTenants] = useState([]); // State to hold tenants data

    const navigate = useNavigate();

    useEffect(() => {
        const fetchTenants = async () => {
            const usersCollection = collection(db, 'users');
            const usersSnapshot = await getDocs(usersCollection);
            const fetchedTenants = usersSnapshot.docs.map((doc) => ({
                id: doc.id,
                name: doc.data().name,
            }));
            console.log(fetchedTenants);
            setTenants(fetchedTenants);
        };
 
        fetchTenants();
    }, []);
    

    
    const uploadPDFToStorage = async (pdfBlob, filename) => {
        const storage = getStorage();
        const storageRef = ref(storage, `leaseAgreements/${filename}.pdf`);
    
        try {
            await uploadBytes(storageRef, pdfBlob);
            console.log('PDF stored in Firebase Storage');
        } catch (error) {
            console.error("Error uploading PDF to Firebase Storage: ", error);
        }
    };

    const calculateLeaseTerm = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const timeDiff = Math.abs(end.getTime() - start.getTime());
        const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        const monthDiff = Math.round(dayDiff / 30); // Approximate the month difference
    
        return monthDiff;
    };
    
    
    const generateAndUploadPDF = async (formData) => {
        const doc = new jsPDF();

        // Logo
        const logoBase64 = 'data:image/png;base64,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'; 
        doc.addImage(logoBase64, 'JPEG', 15, 10, 40, 20);

        // Document Title
        doc.setFontSize(20);
        doc.text("Lease Agreement", 105, 40, null, null, 'center');

        // Body Text
        doc.setFontSize(12);
        let yOffset = 60;
        // Body Text
        const bodyText = `
        This Agreement is made and entered into on ${formData.leaseStartDate} between ${formData.landlordName} (the "Landlord") and ${formData.tenantName} (the "Tenant").

        Premises Address: ${formData.propertyAddress}

        Term: The term of this Lease is for ${calculateLeaseTerm(formData.leaseStartDate, formData.leaseEndDate)} month(s) starting from ${formData.leaseStartDate} to ${formData.leaseEndDate}.

        Monthly Rent: $${formData.monthlyRent} to be paid by the Tenant to the Landlord each month.

        Security Deposit: A security deposit of $${formData.securityDeposit} is to be paid at the signing of this Lease.

        Late Fee: A late fee of $${formData.lateFee} will be charged for any payments that are more than 5 days late.
        `;

        doc.setFont('helvetica');
        doc.text(bodyText, 15, yOffset, { maxWidth: 180, align: "left" });

        // Signature
        const signatureBase64 = "data:image/png;base64,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"; // Your signature base64
        doc.addImage(signatureBase64, 'PNG', 15, doc.internal.pageSize.getHeight() - 30, 40, 20);
        doc.text("Landlord Signature", 15, doc.internal.pageSize.getHeight() - 10);
    
        const pdfBlob = doc.output('blob'); // Correctly obtaining a Blob here
        const filename = `leaseAgreement-${formData.tenantName}-${Date.now()}`;
        await uploadPDFToStorage(pdfBlob, filename); // Uploading the PDF Blob to Firebase Storage
        return filename; // Returning filename to store reference in Firestore
    };

    const saveToFirestore = async (formData, pdfFilename) => {
        const auth = getAuth();
        const user = auth.currentUser;
    
        if (user) {
            try {
                await addDoc(collection(db, "leaseAgreements"), {
                    ...formData,
                    userId: user.uid, // Add the user's ID
                    pdfFilename, // Save the filename or URL of the PDF in Firestore
                    status: formData.status,
                });
                alert('Lease agreement data saved successfully!');
            } catch (error) {
                console.error("Error saving document: ", error);
                alert('Failed to save lease agreement data.');
            }
        } else {
            alert('User not logged in.');
        }
    };

    
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(formData);
        const pdfFilename = await generateAndUploadPDF(formData);
        await saveToFirestore(formData, pdfFilename);
        console.log('Lease Agreement Processed');
        alert('Lease Agreement Submitted and Saved!');
        navigate('/lease-agreements'); 
    };
    

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    return (
        <Container maxWidth="md">
            <Typography variant="h4" component="h1" gutterBottom>
                Lease Agreement Form
            </Typography>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                       <TextField
                           fullWidth
                           select
                           label="Select Tenant"
                           name="tenantId"
                           value={formData.tenantId}
                           onChange={handleChange}
                           required
                       >
                           {tenants.map((tenant) => (
                               <MenuItem key={tenant.id} value={tenant.id}>
                                   {tenant.name}
                               </MenuItem>
                           ))}
                       </TextField>
                   </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Landlord Name"
                            name="landlordName"
                            value={formData.landlordName}
                            onChange={handleChange}
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Property Address"
                            name="propertyAddress"
                            value={formData.propertyAddress}
                            onChange={handleChange}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            type="date"
                            label="Lease Start Date"
                            InputLabelProps={{ shrink: true }}
                            name="leaseStartDate"
                            value={formData.leaseStartDate}
                            onChange={handleChange}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            type="date"
                            label="Lease End Date"
                            InputLabelProps={{ shrink: true }}
                            name="leaseEndDate"
                            value={formData.leaseEndDate}
                            onChange={handleChange}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Monthly Rent"
                            name="monthlyRent"
                            value={formData.monthlyRent}
                            onChange={handleChange}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Security Deposit"
                            name="securityDeposit"
                            value={formData.securityDeposit}
                            onChange={handleChange}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Late Fee"
                            name="lateFee"
                            value={formData.lateFee}
                            onChange={handleChange}
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button variant="contained" color="primary" type="submit">
                            Submit Agreement
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Container>
    );
};

export default LeaseAgreementForm;
