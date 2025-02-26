// app/routes/babi.tsx
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
  const [volume, setVolume] = useState('');
  const [looType, setLooType] = useState('poopoo');
  const [open, setOpen] = useState(false);
  const [openLoo, setOpenLoo] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [logs, setLogs] = useState<Record<string, any[]>>({});

  const types = ['eats', 'loo', 'sleeps'];

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
    await fetch('/api/eats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ volume }),
    });

    setOpen(false);
    setVolume('');

    fetchLogs(types[tabIndex]).then((data) => setLogs(groupByDate(data)));
  };

  const handleSubmitLoo = async () => {
    await fetch('/api/loo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ looType }),
    });

    setOpenLoo(false);
    setLooType('poopoo');

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

  useEffect(() => {
    fetchLogs(types[tabIndex]).then((data) => setLogs(groupByDate(data)));
  }, [tabIndex]);

  return (
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
        <Button
          variant="contained"
          color="success"
          onClick={() => handleClick('sleeps')}
        >
          Sleep
        </Button>
      </div>
      <Box>
        <Tabs
          value={tabIndex}
          onChange={(_, newValue) => setTabIndex(newValue)}
          centered
        >
          <Tab label="Eat" />
          <Tab label="Loo" />
          <Tab label="Sleep" />
        </Tabs>

        <Box sx={{ p: 2 }}>
          {Object.entries(logs).map(([date, entries]) => (
            <div key={date} className="border p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-2">{date}</h2>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2">Date</th>
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
                    <tr key={entry._id} className="border">
                      <td className="border p-2">
                        {new Date(entry.createdAt).toLocaleTimeString()}
                      </td>
                      {types[tabIndex] === 'eats' && (
                        <td className="border p-2">{entry.volume || '-'}</td>
                      )}
                      {types[tabIndex] === 'loo' && (
                        <td className="border p-2">{entry.type || '-'}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </Box>
      </Box>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Enter Volume (ml)</DialogTitle>
        <DialogContent>
          <TextField
            type="number"
            label="Volume (ml)"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openLoo} onClose={() => setOpenLoo(false)}>
        <DialogTitle>Change Diaper</DialogTitle>
        <DialogContent>
          <FormControl fullWidth>
            <Select
              labelId="dropdown-label"
              value={looType}
              onChange={(e) => setLooType(e.target.value)}
            >
              <MenuItem value="poopoo">Poopoo</MenuItem>
              <MenuItem value="weewee">Weewee</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLoo(false)}>Cancel</Button>
          <Button onClick={handleSubmitLoo} variant="contained" color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
