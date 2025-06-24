
import React from 'react';
import { ExternalLink } from 'lucide-react';

const InfoRow = ({ label, value, isLink = false }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
    <p className="text-sm text-gray-400">{label}</p>
    {isLink ? (
      <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-400 hover:underline flex items-center">
        {value.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '')} <ExternalLink size={14} className="ml-1"/>
      </a>
    ) : (
      <p className="text-sm font-semibold text-white">{value}</p>
    )}
  </div>
);

const CompanyProfile = ({ profile }) => {
  const { sector, industry, ceo, website, description } = profile;

  return (
    <div>
      <p className="text-sm text-gray-300 leading-relaxed mb-4">
        {description}
      </p>
      <div className="space-y-1">
        <InfoRow label="Sector" value={sector} />
        <InfoRow label="Industry" value={industry} />
        <InfoRow label="CEO" value={ceo} />
        <InfoRow label="Website" value={website} isLink={true} />
      </div>
    </div>
  );
};

export default CompanyProfile;
