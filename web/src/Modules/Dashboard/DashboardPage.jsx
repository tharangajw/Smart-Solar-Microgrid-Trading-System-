import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SummaryCard from './components/SummaryCard';
import { Users, UserPlus, ShieldCheck } from 'lucide-react';
import { getAllUsers, getPendingActivations } from '../../Services/backofficeApi';

const DashboardPage = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [prosumerCount, setProsumerCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [pendingRes, usersRes] = await Promise.all([getPendingActivations(), getAllUsers()]);
        const pending = pendingRes.data || [];
        const prosumers = (usersRes.data || []).filter((user) => user.role === 'Prosumer');
        setPendingCount(pending.length);
        setProsumerCount(prosumers.length);
        setActiveCount(prosumers.filter((user) => user.isActive).length);
      } catch {
        setPendingCount(0);
      }
    };
    load();
  }, []);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <SummaryCard
          title="Pending Activations"
          value={String(pendingCount)}
          subtitle="waiting for Backoffice approval"
          icon={UserPlus}
        />
        <SummaryCard
          title="Active Prosumers"
          value={String(activeCount)}
          subtitle="can log in on mobile"
          icon={ShieldCheck}
          trend="up"
          trendValue="live"
        />
        <SummaryCard
          title="Total Prosumers"
          value={String(prosumerCount)}
          subtitle="registered via mobile"
          icon={Users}
        />
      </div>

      <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-forest/5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-forest">Activation queue</h2>
          <Link to="/backoffice/pending" className="text-sm font-medium text-sage hover:text-forest transition-colors">
            Open pending list
          </Link>
        </div>
        <p className="text-sm text-charcoal-light">
          Mobile registrations are stored as inactive. Use Pending Activations to approve a prosumer so they can log in and book energy slots.
        </p>
      </section>
    </div>
  );
};

export default DashboardPage;
