import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { Document, Page, pdfjs } from 'react-pdf';
import { List, ListItem, ListItemText, ListItemIcon, Paper, Button } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import GetAppIcon from '@mui/icons-material/GetApp';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const LeaseAgreementsList = () => {
  const [agreements, setAgreements] = useState([]);
  const [isLandlord, setIsLandlord] = useState(false);
const [isTenant, setIsTenant] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
        case 'confirmed':
            return 'green';
        case 'awaiting':
            return 'orange';
        case 'declined':
            return 'red';
        default:
            return 'inherit';
    }
};

const handleTenantConfirmation = async (agreementId, confirm) => {
  try {
      const agreementRef = doc(db, 'leaseAgreements', agreementId);
      await updateDoc(agreementRef, {
          status: confirm ? 'confirmed' : 'declined',
      });
      console.log('Agreement status updated successfully');
  } catch (error) {
      console.error('Error updating agreement status:', error);
  }
};

  useEffect(() => {
    const fetchAgreements = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const q = query(collection(db, 'leaseAgreements'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const fetchedAgreements = [];
        querySnapshot.forEach((doc) => {
            fetchedAgreements.push({ id: doc.id, ...doc.data() });
        });
        setAgreements(fetchedAgreements);

        // Check if the user is a landlord or tenant
        const isLandlord = fetchedAgreements.some((agreement) => agreement.landlordName === user.displayName);
        const isTenant = fetchedAgreements.some((agreement) => agreement.tenantName === user.displayName);
        setIsLandlord(isLandlord);
        setIsTenant(isTenant);
    }
    };

    fetchAgreements();
  }, []);

  // Function to fetch PDF URL and initiate a download
  const downloadPdf = async (pdfFilename) => {
    const storage = getStorage();
    const pdfRef = ref(storage, `leaseAgreements/${pdfFilename}.pdf`);

    try {
      const url = await getDownloadURL(pdfRef);
      // Creating a temporary link to initiate the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${pdfFilename}.pdf`); // Set the file name for the download
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Failed to get PDF URL", error);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row', padding: 20 }}>
      <Paper style={{ marginRight: 20, width: '100%' }}>
        <List>
          {agreements.map((agreement) => (
            <ListItem 
            key={agreement.id}
            secondaryAction={
                <div>
                    <Button
                        variant="contained"
                        startIcon={<GetAppIcon />}
                        onClick={(e) => {
                            e.stopPropagation();
                            downloadPdf(agreement.pdfFilename);
                        }}
                    >
                        Download
                    </Button>
                    {isLandlord && (
                        <span style={{ marginLeft: 10, color: getStatusColor(agreement.status) }}>
                            {agreement.status}
                        </span>
                    )}
                    {isTenant && (
                        <Button
                            variant="contained"
                            color={agreement.status === 'awaiting' ? 'primary' : 'default'}
                            onClick={() => handleTenantConfirmation(agreement.id, agreement.status === 'awaiting')}
                            disabled={agreement.status !== 'awaiting'}
                            style={{ marginLeft: 10 }}
                        >
                            {agreement.status === 'awaiting' ? 'Confirm' : 'Confirmed'}
                        </Button>
                    )}
                </div>
            }
        >
              <ListItemIcon>
                <DescriptionIcon />
              </ListItemIcon>
              <ListItemText primary={`Lease Agreement: ${agreement.tenantName}`} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </div>
  );
};

export default LeaseAgreementsList;
