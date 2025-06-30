'use client';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  useTheme,
  useMediaQuery,
  Stack,
  Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { secondaryDb, storage } from '@/utils/firebase';
import { useRouter } from 'next/navigation';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';

interface Book {
  id: string;
  title: string;
  author: string;
  'aff-link': string;
  'actual-price': string;
  'disc-price': string;
  'image-url': string;
  createdAt: string;
}

const BooksList = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const router = useRouter();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const booksRef = collection(secondaryDb, 'books-aff');
        const q = query(booksRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const booksData: Book[] = [];
        querySnapshot.forEach((doc) => {
          booksData.push({
            id: doc.id,
            ...doc.data()
          } as Book);
        });
        
        setBooks(booksData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch books');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleDeleteClick = (book: Book) => {
    setBookToDelete(book);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!bookToDelete) return;

    setDeleteLoading(bookToDelete.id);
    try {
      // Delete the Firestore document
      const bookRef = doc(secondaryDb, 'books-aff', bookToDelete.id);
      await deleteDoc(bookRef);
      
      // Delete the image from Firebase Storage
      if (bookToDelete['image-url']) {
        try {
          // Extract the file path from the URL
          const imageUrl = bookToDelete['image-url'];
          const imagePath = imageUrl.split('/o/')[1]?.split('?')[0];
          
          if (imagePath) {
            // Decode the URL-encoded path
            const decodedPath = decodeURIComponent(imagePath);
            const imageRef = ref(storage, decodedPath);
            await deleteObject(imageRef);
          }
        } catch (storageError) {
          console.warn('Failed to delete image from storage:', storageError);
          // Don't fail the entire operation if image deletion fails
        }
      }
      
      // Remove the book from the local state
      setBooks(books.filter(book => book.id !== bookToDelete.id));
      
      setDeleteDialogOpen(false);
      setBookToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete book');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setBookToDelete(null);
  };

  if (loading) {
    return (
      <PageContainer title="Books List" description="View all uploaded books">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Books List" description="View all uploaded books">
      <DashboardCard title="Books Database">
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          sx={{ 
            mb: 2,
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 2, sm: 0 }
          }}
        >
          <Typography 
            variant="h6"
            sx={{
              fontSize: { xs: "1.1rem", md: "1.25rem" }
            }}
          >
            Total Books: {books.length}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => router.push('/book-upload')}
            sx={{
              width: { xs: "100%", sm: "auto" },
              height: { xs: 48, md: 40 }
            }}
          >
            Add Book
          </Button>
        </Box>

        {/* Desktop Table View */}
        {!isMobile && (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Image</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Author</TableCell>
                  <TableCell>Actual Price</TableCell>
                  <TableCell>Discount Price</TableCell>
                  <TableCell>Affiliate Link</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {books.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell>
                      <Avatar
                        src={book['image-url']}
                        alt={book.title}
                        sx={{ width: 50, height: 50 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {book.title}
                      </Typography>
                    </TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>
                      <Chip 
                        label={`$${book['actual-price']}`} 
                        color="primary" 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`$${book['disc-price']}`} 
                        color="secondary" 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        href={book['aff-link']}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        variant="outlined"
                      >
                        View Link
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(book.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(book)}
                        disabled={deleteLoading === book.id}
                        size="small"
                      >
                        {deleteLoading === book.id ? (
                          <CircularProgress size={20} />
                        ) : (
                          <DeleteIcon />
                        )}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Mobile Card View */}
        {isMobile && (
          <Box sx={{ mt: 2 }}>
            <Stack spacing={2}>
              {books.map((book) => (
                <Card key={book.id} sx={{ 
                  p: 2,
                  '&:hover': {
                    boxShadow: 3
                  }
                }}>
                  <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                    <Box display="flex" alignItems="flex-start" gap={2}>
                      <Avatar
                        src={book['image-url']}
                        alt={book.title}
                        sx={{ 
                          width: 60, 
                          height: 60,
                          flexShrink: 0
                        }}
                      />
                      <Box flex={1} minWidth={0}>
                        <Typography 
                          variant="h6" 
                          fontWeight={600}
                          sx={{
                            fontSize: "1rem",
                            mb: 0.5,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {book.title}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="textSecondary"
                          sx={{ mb: 1 }}
                        >
                          by {book.author}
                        </Typography>
                        
                        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                          <Chip 
                            label={`$${book['actual-price']}`} 
                            color="primary" 
                            size="small"
                            sx={{ fontSize: "0.75rem" }}
                          />
                          <Chip 
                            label={`$${book['disc-price']}`} 
                            color="secondary" 
                            size="small"
                            sx={{ fontSize: "0.75rem" }}
                          />
                        </Stack>
                        
                        <Typography 
                          variant="caption" 
                          color="textSecondary"
                          sx={{ display: "block", mb: 2 }}
                        >
                          Added: {new Date(book.createdAt).toLocaleDateString()}
                        </Typography>
                        
                        <Stack 
                          direction="row" 
                          spacing={1}
                          sx={{
                            justifyContent: "space-between",
                            alignItems: "center"
                          }}
                        >
                          <Button
                            href={book['aff-link']}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="small"
                            variant="outlined"
                            sx={{
                              fontSize: "0.75rem",
                              minWidth: "auto",
                              px: 2
                            }}
                          >
                            View Link
                          </Button>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(book)}
                            disabled={deleteLoading === book.id}
                            size="small"
                            sx={{
                              width: 40,
                              height: 40
                            }}
                          >
                            {deleteLoading === book.id ? (
                              <CircularProgress size={20} />
                            ) : (
                              <DeleteIcon />
                            )}
                          </IconButton>
                        </Stack>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        )}

        {books.length === 0 && !loading && (
          <Box textAlign="center" py={4}>
            <Typography 
              variant="h6" 
              color="textSecondary"
              sx={{
                fontSize: { xs: "1.1rem", md: "1.25rem" }
              }}
            >
              No books found in the database
            </Typography>
            <Typography 
              variant="body2" 
              color="textSecondary" 
              sx={{ 
                mt: 1,
                fontSize: { xs: "0.875rem", md: "1rem" }
              }}
            >
              Upload some books to see them here
            </Typography>
          </Box>
        )}
      </DashboardCard>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete &ldquo;{bookToDelete?.title}&rdquo; by {bookToDelete?.author}? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={deleteLoading === bookToDelete?.id}
          >
            {deleteLoading === bookToDelete?.id ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default BooksList; 