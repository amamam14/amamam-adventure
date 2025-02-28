import {
  Button,
  Container,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Box,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import { useEffect, useState } from 'react';

export default function Babi() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const correctPassword = 'amamam'; // Change this!

  const [volume, setVolume] = useState('');
  const [looType, setLooType] = useState('poopoo');
  const [eatType, setEatType] = useState('breast milk');
  const [open, setOpen] = useState(false);
  const [openLoo, setOpenLoo] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [logs, setLogs] = useState<Record<string, any[]>>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [editMode, setEditMode] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<{
    id: string;
    type: string;
  } | null>(null);

  const types = ['eats', 'loo', 'sleeps'];

  useEffect(() => {
    if (isAuthenticated) {
      fetchLogs(types[tabIndex]).then((data) => setLogs(groupByDate(data)));
    }
  }, [tabIndex, isAuthenticated]);

  const handleClick = async (type) => {
    if (type === 'eats') {
      setOpen(true);
    } else if (type === 'loo') {
      setOpenLoo(true);
    } else {
      await fetch(`/api/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });

      fetchLogs(types[tabIndex]).then((data) => setLogs(groupByDate(data)));
    }
  };

  const handleSubmit = async () => {
    const payload = { volume, type: eatType, createdAt: selectedDate };

    await fetch('/api/eats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        id: editingEntry ? editingEntry._id : null,
      }),
    });

    setOpen(false);
    setVolume('');
    setEditingEntry(null);
    setEditMode(false);

    fetchLogs(types[tabIndex]).then((data) => setLogs(groupByDate(data)));
  };

  const handleSubmitLoo = async () => {
    const payload = { type: looType, createdAt: selectedDate };

    await fetch('/api/loo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        id: editingEntry ? editingEntry._id : null,
      }),
    });

    setOpenLoo(false);
    setLooType('poopoo');
    setEditingEntry(null);
    setEditMode(false);

    fetchLogs(types[tabIndex]).then((data) => setLogs(groupByDate(data)));
  };

  const fetchLogs = async (type: string) => {
    const response = await fetch(`/api/${type}`);
    const data = await response.json();
    return data[type];
  };

  const groupByDate = (data: any[]) => {
    return data?.reduce((acc, item) => {
      const date = new Date(item.createdAt).toLocaleDateString();
      acc[date] = acc[date] || [];
      acc[date].push(item);
      return acc;
    }, {} as Record<string, any[]>);
  };

  const handleAuthSubmit = () => {
    if (password === correctPassword) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password!');
    }
  };

  const handleEdit = (entry, type) => {
    setEditingEntry(entry);
    setEditMode(true);
    setSelectedDate(new Date(entry.createdAt));
    if (type === 'eats') {
      setVolume(entry.volume);
      setOpen(true);
    } else if (type === 'loo') {
      setLooType(entry.type);
      setOpenLoo(true);
    }
  };

  const handleDelete = async () => {
    if (!entryToDelete) return;

    await fetch(`/api/${types[tabIndex]}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: entryToDelete.id }),
    });

    setOpenDeleteDialog(false);
    setEntryToDelete(null);
    fetchLogs(types[tabIndex]).then((data) => setLogs(groupByDate(data)));
  };

  const confirmDelete = (entry, type) => {
    setEntryToDelete({ id: entry._id, type });
    setOpenDeleteDialog(true);
  };

  return (
    <>
      {/* Password Prompt */}
      <Dialog open={!isAuthenticated} disableEscapeKeyDown>
        <DialogContent>
          <TextField
            type="password"
            label="Password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAuthSubmit} variant="contained" fullWidth>
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Main Content (Only visible after authentication) */}
      {isAuthenticated && (
        <Container className="flex flex-col gap-4 p-4 items-center">
          <div className="flex gap-2">
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleClick('eats')}
            >
              Eat
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => handleClick('loo')}
            >
              Loo
            </Button>
            {/* <Button
              variant="contained"
              color="success"
              onClick={() => handleClick('sleeps')}
            >
              Sleep
            </Button> */}
          </div>
          <Box>
            <Tabs
              value={tabIndex}
              onChange={(_, newValue) => setTabIndex(newValue)}
              centered
            >
              <Tab label="Eat" />
              <Tab label="Loo" />
              {/* <Tab label="Sleep" /> */}
            </Tabs>

            <Box sx={{ p: 2 }}>
              {Object.entries(logs).map(([date, entries]) => (
                <div
                  key={date}
                  className="border p-4 rounded-lg shadow-md mt-2"
                >
                  <h2 className="text-xl font-bold mb-2">{date}</h2>
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2">Date</th>
                        {types[tabIndex] === 'eats' && (
                          <th className="border p-2">Type</th>
                        )}
                        {types[tabIndex] === 'eats' && (
                          <th className="border p-2">Volume (ml)</th>
                        )}
                        {types[tabIndex] === 'loo' && (
                          <th className="border p-2">Type</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry) => (
                        <tr key={entry._id} className="border cursor-pointer">
                          <td className="border p-2">
                            {new Date(entry.createdAt).toLocaleTimeString()}
                          </td>
                          {types[tabIndex] === 'eats' && (
                            <td className="border p-2">{entry.type || '-'}</td>
                          )}
                          {types[tabIndex] === 'eats' && (
                            <td className="border p-2">
                              {entry.volume || '-'}
                            </td>
                          )}
                          {types[tabIndex] === 'loo' && (
                            <td className="border p-2">{entry.type || '-'}</td>
                          )}
                          <td className="border p-2 flex gap-2 group relative bg-gray-50 hover:bg-gray-100 transition-colors">
                            <Button
                              size="small"
                              variant="outlined"
                              className="opacity-0 group-hover:opacity-100 transition-opacity border border-gray-400"
                              onClick={() => handleEdit(entry, types[tabIndex])}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              className="opacity-0 group-hover:opacity-100 transition-opacity border border-red-400"
                              onClick={() =>
                                confirmDelete(entry, types[tabIndex])
                              }
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </Box>
          </Box>
          <Dialog open={open} onClose={() => setOpen(false)}>
            <DialogTitle>
              {editMode ? 'Edit Entry' : 'Enter Volume (ml)'}
            </DialogTitle>
            <DialogContent>
              <Box display="flex" flexDirection="column" gap={2} p={1}>
                <FormControl fullWidth>
                  <Select
                    labelId="dropdown-label"
                    value={eatType}
                    onChange={(e) => setEatType(e.target.value)}
                  >
                    <MenuItem value="formula">Formula</MenuItem>
                    <MenuItem value="breast milk">Breast Milk</MenuItem>
                    <MenuItem value="latch">Latch</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  type="number"
                  label="Volume (ml)"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  fullWidth
                />

                <TextField
                  type="datetime-local"
                  value={
                    selectedDate
                      ? new Date(
                          selectedDate.getTime() -
                            selectedDate.getTimezoneOffset() * 60000
                        )
                          .toISOString()
                          .slice(0, 16)
                      : ''
                  }
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </DialogContent>

            <DialogActions>
              <Button
                onClick={() => {
                  setSelectedDate(new Date());
                  setEditingEntry(null);
                  setEditMode(false);
                  setVolume('');
                  setOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                variant="contained"
                color="primary"
              >
                Submit
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={openLoo} onClose={() => setOpenLoo(false)}>
            <DialogTitle>Change Diaper</DialogTitle>
            <DialogContent>
              <Box display="flex" flexDirection="column" gap={2} p={1}>
                <FormControl fullWidth>
                  <Select
                    labelId="dropdown-label"
                    value={looType}
                    onChange={(e) => setLooType(e.target.value)}
                  >
                    <MenuItem value="poopoo">Poopoo</MenuItem>
                    <MenuItem value="weewee">Weewee</MenuItem>
                    <MenuItem value="both">Both</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  type="datetime-local"
                  value={
                    selectedDate
                      ? new Date(
                          selectedDate.getTime() -
                            selectedDate.getTimezoneOffset() * 60000
                        )
                          .toISOString()
                          .slice(0, 16)
                      : ''
                  }
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  setSelectedDate(new Date());
                  setEditingEntry(null);
                  setEditMode(false);
                  setVolume('');
                  setOpenLoo(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitLoo}
                variant="contained"
                color="primary"
              >
                Submit
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={openDeleteDialog}
            onClose={() => setOpenDeleteDialog(false)}
          >
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
              <p>Are you sure you want to delete this entry?</p>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
              <Button onClick={handleDelete} color="error" variant="contained">
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      )}
    </>
  );
}
