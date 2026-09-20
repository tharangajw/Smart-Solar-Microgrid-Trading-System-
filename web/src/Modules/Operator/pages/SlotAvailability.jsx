import React, { useState, useEffect } from 'react';
import SlotCard from '../Components/SlotCard';
import { getAllStations, updateSlotAvailability } from '../../../Services/operatorApi';
import { useStationUpdates } from '../../../Hooks/useStationUpdates';

const SlotAvailability = () => {
  // useStationUpdates manages its own state & SignalR live patches.
  const [nodes, setNodes] = useStationUpdates();
  const [loading, setLoading] = useState(true);
  const [updateMessage, setUpdateMessage] = useState(null);
  const [editingNode, setEditingNode] = useState(null);
  const [slotValue, setSlotValue] = useState('');

  // Initial REST load — runs once on mount
  useEffect(() => {
    getAllStations()
      .then((response) => setNodes(response.data))
      .catch(() => setUpdateMessage({ type: 'error', text: 'Unable to load station data.' }))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpdateSlot = (node) => {
    setEditingNode(node); setSlotValue(String(node.availableSlots));
  };

  const saveSlots = async (event) => {
    event.preventDefault();
    try {
      // REST API call to update slots — SignalR will then push the update to all clients
      const response = await updateSlotAvailability(editingNode.id, Number(slotValue));
      setNodes((current) => current.map((node) => node.id === editingNode.id ? response.data : node));
      setUpdateMessage({ type: 'success', text: `Successfully updated slots for ${editingNode.name}.` });
      setEditingNode(null);
    } catch (err) { setUpdateMessage({ type: 'error', text: err.response?.data?.message || 'Unable to update slots.' }); }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-forest">Battery Slot Availability</h1>
        <p className="text-sm text-charcoal-light mt-1">Monitor and update microgrid node battery slots · live via SignalR</p>
      </div>

      {updateMessage && (
        <div className={`rounded-xl border px-4 py-3 text-sm font-medium flex items-center gap-2
          ${updateMessage.type === 'success'
            ? 'bg-leaf/10 border-leaf/30 text-forest'
            : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${updateMessage.type === 'success' ? 'bg-leaf' : 'bg-red-400 animate-pulse'}`} />
          {updateMessage.text}
        </div>
      )}
      {editingNode && <form onSubmit={saveSlots} className="flex items-end gap-3 rounded-xl border border-emerald-200 bg-white p-4"><label className="flex-1 text-sm font-semibold text-slate-700">Available slots <input min="0" max={editingNode.totalSlots} required type="number" value={slotValue} onChange={(event) => setSlotValue(event.target.value)} className="mt-1 block w-full rounded-lg border p-2" /></label><button className="rounded-lg bg-emerald-600 px-4 py-2 text-white">Save</button><button type="button" onClick={() => setEditingNode(null)} className="rounded-lg border px-4 py-2">Cancel</button></form>}

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-forest border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-charcoal-light font-medium">Loading station data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {nodes.map(node => (
            <SlotCard key={node.id} node={node} onUpdateSlot={handleUpdateSlot} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SlotAvailability;
