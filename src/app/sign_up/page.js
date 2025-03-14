'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, TextField, Button, Typography, Box, Alert } from '@mui/material';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password_confirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3000/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, password_confirmation }),
      });

      const data = await response.json();
      console.log('Usuario registrado:', data);

      if (!response.ok) {
        throw new Error(data.errors.full_messages);
      }
      router.push('/sign_in');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Sign Up
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Name"
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            variant="outlined"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            variant="outlined"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Confirm Password"
            variant="outlined"
            type="password"
            value={password_confirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
          />
          <Button
            fullWidth
            variant="contained"
            type="submit"
            sx={{ mt: 3, mb: 2 }}
          >
            Submit
          </Button>
        </form>
      </Box>
    </Container>
  );
}