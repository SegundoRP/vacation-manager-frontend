import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
} from "@mui/material";

export default function AddVacationModal({ open, onClose }) {
  const [formData, setFormData] = useState({
    user_id: "",
    start_date: "",
    end_date: "",
    request_type: "",
    reason: "",
    status: "",
  });

  const [employees, setEmployees] = useState([]);
  const [errors, setErrors] = useState('');

  const accessToken = localStorage.getItem('access-token');
  const client = localStorage.getItem('client');
  const uid = localStorage.getItem('uid');

  useEffect(() => {
    if (open) {
      fetch("http://localhost:3000/api/v1/users", {
        headers: {
          'access-token': accessToken,
          'client': client,
          'uid': uid,
        },
      })
        .then((res) => res.json())
        .then((data) => setEmployees(data.data))
        .catch((error) => console.error('Error fetching employees:', error));
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    createVacation(formData);
    setFormData({
      user_id: "",
      start_date: "",
      end_date: "",
      request_type: "",
      reason: "",
      status: "",
    });
  };

  const createVacation = async (formData) => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/time_off_requests', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'access-token': accessToken,
          'client': client,
          'uid': uid,
      },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!data.errors) {
        onClose();
      } else {
        setErrors(data.errors.map(error => error.detail).join(', '));
      }
    } catch (error) {
      console.error('Error adding request:', error);
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add New Vacation Request</DialogTitle>
      {errors && <Alert severity="error">{errors}</Alert>}
      <DialogContent>

        <FormControl fullWidth margin="normal">
          <InputLabel>Employee</InputLabel>
          <Select
            name="user_id"
            value={formData.user_id}
            onChange={handleChange}
            required
          >
            {employees.map((employee) => (
              <MenuItem key={employee.id} value={employee.id}>
                {employee.attributes.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          margin="normal"
          label="Start Date"
          type="date"
          name="start_date"
          value={formData.start_date}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          fullWidth
          margin="normal"
          label="End Date"
          type="date"
          name="end_date"
          value={formData.end_date}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          fullWidth
          margin="normal"
          label="Request Type"
          name="request_type"
          value={formData.request_type}
          onChange={handleChange}
          select
          required
        >
          <MenuItem value="vacation">Vacation</MenuItem>
          <MenuItem value="incapacity">Incapacity</MenuItem>
        </TextField>
        <TextField
          fullWidth
          margin="normal"
          label="Reason"
          name="reason"
          value={formData.reason}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          select
          required
        >
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="approved">Approved</MenuItem>
          <MenuItem value="rejected">Rejected</MenuItem>
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} color="primary">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
