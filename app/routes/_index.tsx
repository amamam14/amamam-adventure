// app/routes/babi.tsx
import { useFetcher, useLoaderData } from '@remix-run/react';
import {
  Button,
  Container,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
} from '@mui/material';
import { useState } from 'react';
import { json } from '@remix-run/node';
import { getClient } from '../utils/db.server';

export async function loader() {
  const db = await getClient();
  const [eats, loo, sleeps] = await Promise.all([
    db.collection('eats').find().sort({ createdAt: -1 }).toArray(),
    db.collection('loo').find().sort({ createdAt: -1 }).toArray(),
    db.collection('sleeps').find().sort({ createdAt: -1 }).toArray(),
  ]);

  return json({ eats, loo, sleeps });
}

export default function Babi() {
  const { eats, loo, sleeps } = useLoaderData();
  const fetcher = useFetcher();
  const [tab, setTab] = useState(0);
  const [volume, setVolume] = useState('');
  const [open, setOpen] = useState(false);

  const handleClick = async (type) => {
    if (type === 'eats') {
      setOpen(true);
    } else {
      await fetch(`/api/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
    }
  };

  const handleSubmit = async () => {
    await fetch('/api/eats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ volume }),
    });

    fetcher.submit(
      { type: 'eats', volume },
      { method: 'post', action: '/api/eats' }
    );
    setOpen(false);
    setVolume('');
  };

  const getFilteredData = () => {
    if (tab === 0) return eats;
    if (tab === 1) return loo;
    return sleeps;
  };

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
      <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)}>
        <Tab label="Eat" />
        <Tab label="Loo" />
        <Tab label="Sleep" />
      </Tabs>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Created At</TableCell>
            {tab === 0 && <TableCell>Volume (ml)</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {getFilteredData().map((entry) => (
            <TableRow key={entry._id}>
              <TableCell>
                {new Date(entry.createdAt).toLocaleString()}
              </TableCell>
              {tab === 0 && <TableCell>{entry.volume} ml</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
    </Container>
  );
}
