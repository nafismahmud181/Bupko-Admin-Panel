// src/app/authentication/login-modern/page.tsx

"use client";
import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  Stack,
  Checkbox,
  FormControlLabel,
  TextField,
  Divider,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress
} from "@mui/material";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Logo from "@/app/(DashboardLayout)/layout/shared/logo/Logo";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../utils/firebase';

const LoginModern = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleShowPassword = () => setShowPassword((show) => !show);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log("Login successful:", user.email);
      
      // Optional: Store user info in localStorage if "Keep me logged in" is checked
      if (keepLoggedIn) {
        localStorage.setItem('keepLoggedIn', 'true');
      }
      
      // Redirect to dashboard
      router.push("/");
      
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Handle specific Firebase Auth errors
      switch (error.code) {
        case 'auth/user-not-found':
          setError("No user found with this email address.");
          break;
        case 'auth/wrong-password':
          setError("Incorrect password. Please try again.");
          break;
        case 'auth/invalid-email':
          setError("Invalid email address format.");
          break;
        case 'auth/user-disabled':
          setError("This account has been disabled.");
          break;
        case 'auth/too-many-requests':
          setError("Too many failed attempts. Please try again later.");
          break;
        case 'auth/invalid-credential':
          setError("Invalid email or password. Please check your credentials.");
          break;
        case 'auth/network-request-failed':
          setError("Network error. Please check your internet connection.");
          break;
        default:
          setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container sx={{ minHeight: "100vh" }}>
      {/* Left: Login Form */}
      <Grid sx={{ display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "background.default", flex: 1 }}>
        <Box sx={{ width: "100%", maxWidth: 420, mx: "auto", p: 4 }}>
          <Typography variant="h3" fontWeight={700} mb={1}>
            Sign In
          </Typography>
          <Typography color="textSecondary" mb={3}>
            Enter your email and password to sign in!
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Divider sx={{ my: 3 }}>Or</Divider>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              margin="normal"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              disabled={loading}
              placeholder="Enter your email"
            />
            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              required
              margin="normal"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
              placeholder="Enter your password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleShowPassword} edge="end" disabled={loading}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1, mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={keepLoggedIn} 
                    onChange={e => setKeepLoggedIn(e.target.checked)} 
                    disabled={loading}
                  />
                }
                label="Keep me logged in"
              />
            </Stack>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              fullWidth 
              size="large" 
              sx={{ fontWeight: 600, mb: 2 }}
              disabled={loading}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} color="inherit" />
                  Signing in...
                </Box>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </Box>
      </Grid>
      {/* Right: Branding */}
      <Grid sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#181f4b",
        color: "#fff",
        position: "relative",
        minHeight: "100vh",
        flex: 1
      }}>
        <Box sx={{ width: "100%", textAlign: "center", position: "relative", zIndex: 1 }}>
          <Typography variant="h4" fontWeight={700} mb={1}>
            TailAdmin
          </Typography>
          <Typography variant="subtitle1" color="#bfc8e2">
            Free and Open-Source Tailwind CSS Admin<br />Dashboard Template
          </Typography>
        </Box>
        {/* Decorative grid background */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
            background:
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 40px), repeating-linear-gradient(180deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 40px)",
          }}
        />
      </Grid>
    </Grid>
  );
};

export default LoginModern;