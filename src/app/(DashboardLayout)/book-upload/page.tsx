'use client';
import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Input
} from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';

const BookUpload = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [bookData, setBookData] = useState({
    title: '',
    author: '',
    description: '',
    price: '',
    isbn: ''
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(event.target.files[0]);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setBookData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle form submission here
    console.log('Book Data:', bookData);
    console.log('Selected Image:', selectedImage);
  };

  return (
    <PageContainer title="Book Upload" description="Upload new book information">
      <DashboardCard title="Upload Book">
        <form onSubmit={handleSubmit}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} lg={6}>
                <TextField
                  fullWidth
                  label="Book Title"
                  name="title"
                  value={bookData.title}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Author"
                  name="author"
                  value={bookData.author}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="ISBN"
                  name="isbn"
                  value={bookData.isbn}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  type="number"
                  value={bookData.price}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} lg={6}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={bookData.description}
                  onChange={handleInputChange}
                  margin="normal"
                  multiline
                  rows={4}
                  required
                />
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Book Cover Image
                  </Typography>
                  <Input
                    type="file"
                    onChange={handleImageChange}
                    sx={{ mb: 2 }}
                    inputProps={{ accept: 'image/*' }}
                  />
                  {selectedImage && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        Selected file: {selectedImage.name}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  sx={{ mt: 2 }}
                >
                  Upload Book
                </Button>
              </Grid>
            </Grid>
          </Box>
        </form>
      </DashboardCard>
    </PageContainer>
  );
};

export default BookUpload;