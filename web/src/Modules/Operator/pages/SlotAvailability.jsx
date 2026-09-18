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
    <div className="space-y-8 min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30 p-2 sm:p-6 rounded-3xl">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 animate-fade-in-down">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-700 tracking-tight">
            Battery Slot Availability
          </h1>
          <p className="text-sm sm:text-base font-medium text-slate-500 mt-2">
            Monitor and update microgrid node battery slots · live via SignalR
          </p>
        </div>
      </div>

      {updateMessage && (
        <div className={`p-4 rounded-xl shadow-sm border animate-fade-in-down flex items-center gap-3 font-medium ${
          updateMessage.type === 'success' ? 'bg-green-50/80 backdrop-blur-md border-green-200 text-green-800' :
          'bg-blue-50/80 backdrop-blur-md border-blue-200 text-blue-800'
        }`}>
          <div className={`w-2 h-2 rounded-full ${updateMessage.type === 'success' ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`}></div>
          {updateMessage.text}
        </div>
      )}
      {editingNode && <form onSubmit={saveSlots} className="flex items-end gap-3 rounded-xl border border-emerald-200 bg-white p-4"><label className="flex-1 text-sm font-semibold text-slate-700">Available slots <input min="0" max={editingNode.totalSlots} required type="number" value={slotValue} onChange={(event) => setSlotValue(event.target.value)} className="mt-1 block w-full rounded-lg border p-2" /></label><button className="rounded-lg bg-emerald-600 px-4 py-2 text-white">Save</button><button type="button" onClick={() => setEditingNode(null)} className="rounded-lg border px-4 py-2">Cancel</button></form>}

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Loading node data...</p>
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
