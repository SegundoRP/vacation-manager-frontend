'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/app/hooks/useAuth';
import { useLogout } from '@/app/utils/logout';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Button,
  Container,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TextField,
  MenuItem,
} from '@mui/material';
import AddVacationModal from '@/app/components/AddVacationModal';
import { TablePagination } from '@mui/material';

function fetchVacations(page = 1, perPage = 10, search = '', filters = {}) {
  const accessToken = localStorage.getItem('access-token');
  const client = localStorage.getItem('client');
  const uid = localStorage.getItem('uid');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  console.log(apiUrl);

  // Build the parameters for Ransack
  const params = new URLSearchParams({
    page,
    per_page: perPage,
    ...(search && { 'filters[user_name_cont]': search }), // Search by name
    ...(filters.status !== 'all' && { 'filters[status_eq]': filters.status }), // Filter by status (number)
    ...(filters.startDate && { 'filters[start_date_gteq]': filters.startDate }), // Filter by start date
    ...(filters.endDate && { 'filters[end_date_lteq]': filters.endDate }), // Filter by end date
  });

  return fetch(`${apiUrl}/api/v1/time_off_requests?${params.toString()}`, {
    headers: {
      'access-token': accessToken,
      'client': client,
      'uid': uid,
    },
  }).then((res) => res.json());
}

function SearchBar({ searchTerm, onSearchChange, onSearch, inputRef }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <TextField
        inputRef={inputRef}
        fullWidth
        margin="normal"
        label="Search by Employee Name"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onSearch();
          }
        }}
      />
      <Button variant="contained" color="primary" onClick={onSearch}>
        Search
      </Button>
    </div>
  );
}

function Filters({ filters, onFilterChange }) {
  return (
    <div>
      <TextField
        select
        label="Status"
        value={filters.status}
        onChange={(e) => onFilterChange('status', e.target.value)}
        sx={{ mr: 2, minWidth: 120 }}
      >
        <MenuItem value="all">All</MenuItem>
        <MenuItem value={1}>Approved</MenuItem>
        <MenuItem value={2}>Rejected</MenuItem>
      </TextField>
      <TextField
        label="Start Date"
        type="date"
        value={filters.startDate}
        onChange={(e) => onFilterChange('startDate', e.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={{ mr: 2 }}
      />
      <TextField
        label="End Date"
        type="date"
        value={filters.endDate}
        onChange={(e) => onFilterChange('endDate', e.target.value)}
        InputLabelProps={{ shrink: true }}
      />
    </div>
  );
}

function Pagination({ page, rowsPerPage, totalRows, onPageChange, onRowsPerPageChange }) {
  return (
    <TablePagination
      rowsPerPageOptions={[5, 10, 25, 50]}
      component="div"
      count={totalRows}
      rowsPerPage={rowsPerPage}
      page={page}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
    />
  );
}

function VacationsContainer() {
  const searchInputRef = useRef(null);
  const isAuthenticated = useAuth();
  const logout = useLogout();
  const [openModal, setOpenModal] = useState(false);

  // Read the parameters from the URL
  const searchParams = useSearchParams();
  const urlPage = parseInt(searchParams.get('page') || 1, 10);
  const urlPerPage = parseInt(searchParams.get('per_page') || 10, 10);
  const urlSearch = searchParams.get('search') || '';
  const urlFilters = {
    status: searchParams.get('status') || 'all',
    startDate: searchParams.get('start_date') || '',
    endDate: searchParams.get('end_date') || '',
  };

  const [page, setPage] = useState(urlPage);
  const [perPage, setPerPage] = useState(urlPerPage);
  const [localSearchTerm, setLocalSearchTerm] = useState(urlSearch); // Local state for the search
  const [searchQuery, setSearchQuery] = useState(urlSearch); // For the real query
  const [filters, setFilters] = useState(urlFilters);

  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  
  // Function to update the URL
  const updateUrl = useCallback((newPage, newPerPage, newSearch, newFilters = filters) => {
    const params = new URLSearchParams({
      page: newPage,
      per_page: newPerPage,
      search: newSearch,
      status: newFilters.status,
      start_date: newFilters.startDate,
      end_date: newFilters.endDate,
    });
    router.replace(`?${params.toString()}`);
  }, [router, filters]);

  // Function to handle the search
  const handleSearch = () => {
    setSearchQuery(localSearchTerm); // Update the term that uses the query
    setPage(1); // Reset to the first page
    updateUrl(1, perPage, localSearchTerm, filters);
  };

  // Update the URL when the filters change
  useEffect(() => {
    updateUrl(page, perPage, localSearchTerm, filters);
  }, [filters, page, perPage, updateUrl]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['vacations', page, perPage, searchQuery, filters],
    queryFn: () => fetchVacations(page, perPage, searchQuery, filters),
    enabled: isAuthenticated,
  });

  // Check if the user is authenticated
  useEffect(() => {
    if (isAuthenticated !== null) {
      setAuthChecked(true);
    }
  }, [isAuthenticated]);

  // Redirect the user to the login page if they are not authenticated
  useEffect(() => {
    if (authChecked && !isAuthenticated) {
      router.push('/sign_in'); // Redirect the user to the login page
    }
  }, [authChecked, isAuthenticated, router]);

  // Return null if the user is not authenticated
  if (!authChecked) {
    return null;
  }


  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const pagination = data?.pagination || {
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    per_page: perPage,
  };

  return (
    <Container>
      <Button
        variant="contained"
        color="error"
        onClick={logout}
        style={{ position: 'absolute', top: '20px', right: '20px' }}
      >
        Logout
      </Button>

      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4, mb: 4 }}>
        Vacation Requests
      </Typography>

      <Button variant="contained" color="primary" onClick={() => setOpenModal(true)}>
        Add New Request
      </Button>

      <SearchBar
        searchTerm={localSearchTerm}
        onSearchChange={setLocalSearchTerm}
        onSearch={handleSearch}
        inputRef={searchInputRef}
      />
      <Filters filters={filters} onFilterChange={(key, value) => setFilters({ ...filters, [key]: value })} />

      <Paper elevation={3} sx={{ overflowX: 'auto', mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Employee Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Leader</strong></TableCell>
              <TableCell><strong>Start Date</strong></TableCell>
              <TableCell><strong>End Date</strong></TableCell>
              <TableCell><strong>Request Type</strong></TableCell>
              <TableCell><strong>Reason</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.time_off_requests?.data?.map((vacation) => {
              const attributes = vacation.attributes;
              return (
                <TableRow key={vacation.id}>
                  <TableCell>{vacation.id}</TableCell>
                  <TableCell>{attributes['user-name']}</TableCell>
                  <TableCell>{attributes['user-email']}</TableCell>
                  <TableCell>{attributes['user-leader-name']}</TableCell>
                  <TableCell>{attributes['start-date']}</TableCell>
                  <TableCell>{attributes['end-date']}</TableCell>
                  <TableCell>{attributes['request-type']}</TableCell>
                  <TableCell>{attributes['reason']}</TableCell>
                  <TableCell
                    sx={{
                      color:
                        attributes['status'] === 'approved'
                          ? 'success.main'
                          : attributes['status'] === 'rejected'
                          ? 'error.main'
                          : 'text.secondary',
                    }}
                  >
                    {attributes['status']}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      <Pagination
        page={pagination.current_page - 1} // MUI uses base 0
        rowsPerPage={pagination.per_page}
        totalRows={pagination.total_count}
        onPageChange={(e, newPage) => setPage(newPage + 1)} // MUI uses base 0
        onRowsPerPageChange={(e) => {
          const newPerPage = parseInt(e.target.value, 10);
          setPerPage(newPerPage); // Update the state of perPage
          setPage(1); // Reset the page to 1 when the number of records per page changes
        }}
      />

      <AddVacationModal
        open={openModal}
        onClose={() => setOpenModal(false)}
      />
    </Container>
  );
}

export default function Vacations() { 
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VacationsContainer />
    </Suspense>
  );
}
