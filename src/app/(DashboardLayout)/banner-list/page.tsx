'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  IconButton,
  Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { secondaryDb, storage } from '@/utils/firebase';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';

interface Banner {
  id: string;
  imageUrl: string;
  createdAt: string;
}

const BannerList = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const bannersRef = collection(secondaryDb, 'banners');
        const q = query(bannersRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const bannersData: Banner[] = [];
        querySnapshot.forEach((doc) => {
          bannersData.push({
            id: doc.id,
            ...doc.data()
          } as Banner);
        });
        
        setBanners(bannersData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch banners');
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const handleDeleteClick = (banner: Banner) => {
    setBannerToDelete(banner);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!bannerToDelete) return;

    setDeleteLoading(bannerToDelete.id);
    try {
      // Delete the Firestore document
      const bannerRef = doc(secondaryDb, 'banners', bannerToDelete.id);
      await deleteDoc(bannerRef);
      
      // Delete the image from Firebase Storage
      if (bannerToDelete.imageUrl) {
        try {
          const imageRef = ref(storage, bannerToDelete.imageUrl);
          await deleteObject(imageRef);
        } catch (storageError: any) {
          // If the image is already deleted or doesn't exist, we can ignore the error
          if(storageError.code !== 'storage/object-not-found') {
            console.warn('Failed to delete image from storage:', storageError);
            // Optionally, you can re-throw or handle other storage errors here
          }
        }
      }
      
      setBanners(banners.filter(banner => banner.id !== bannerToDelete.id));
      
      setDeleteDialogOpen(false);
      setBannerToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete banner');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setBannerToDelete(null);
  };

  if (loading) {
    return (
      <PageContainer title="Banner List" description="View all uploaded banners">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Banner List" description="View and manage uploaded banners">
      <DashboardCard title="Banner Images">
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          {banners.map((banner) => (
            <Grid item xs={12} sm={6} md={4} key={banner.id}>
              <Card sx={{ position: 'relative' }}>
                <Box sx={{ height: 200, position: 'relative' }}>
                  <Image
                    src={banner.imageUrl}
                    alt="Banner Image"
                    layout="fill"
                    objectFit="cover"
                  />
                </Box>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <IconButton 
                    onClick={() => handleDeleteClick(banner)} 
                    disabled={deleteLoading === banner.id}
                    size="large"
                  >
                    {deleteLoading === banner.id ? <CircularProgress size={24} /> : <DeleteIcon />}
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {banners.length === 0 && !loading && (
          <Box textAlign="center" mt={4}>
            <Typography variant="h6">No banners found.</Typography>
            <Typography color="textSecondary">Upload a banner to see it here.</Typography>
          </Box>
        )}
      </DashboardCard>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Banner</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this banner? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default BannerList; 