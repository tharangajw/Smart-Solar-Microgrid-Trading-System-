import React, { useState, useEffect } from 'react';
import SlotCard from '../Components/SlotCard';

const SlotAvailability = () => {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updateMessage, setUpdateMessage] = useState(null);

  useEffect(() => {
    // Mock fetching nodes
    setTimeout(() => {
      setNodes([
        { id: '1', name: 'Node A - Colombo', location: 'Colombo 03', availableSlots: 4, totalSlots: 10, status: 'available' },
        { id: '2', name: 'Node B - Kandy', location: 'Kandy Central', availableSlots: 0, totalSlots: 8, status: 'full' },
        { id: '3', name: 'Node C - Galle', location: 'Galle Fort', availableSlots: 2, totalSlots: 5, status: 'available' },
        { id: '4', name: 'Node D - Jaffna', location: 'Jaffna Town', availableSlots: 0, totalSlots: 4, status: 'unavailable' },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const handleUpdateSlot = (node) => {
    // In a real app, this would open a modal with a form to update the slots,
    // and then call updateSlotAvailability(node.id, data) API.
    
    // Simulating an update action
    setUpdateMessage({ type: 'info', text: `Initiating slot update for ${node.name}...` });
    
    setTimeout(() => {
      setUpdateMessage({ type: 'success', text: `Successfully updated slots for ${node.name}.` });
      
      // Clear message after 3 seconds
      setTimeout(() => setUpdateMessage(null), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-8 min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30 p-2 sm:p-6 rounded-3xl">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 animate-fade-in-down">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-700 tracking-tight">
            Battery Slot Availability
          </h1>
          <p className="text-sm sm:text-base font-medium text-slate-500 mt-2">
            Monitor and update microgrid node battery slots
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
